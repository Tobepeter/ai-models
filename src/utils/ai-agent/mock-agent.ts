import axios from 'axios'
import { createParser } from 'eventsource-parser'
import { IAiAgent } from './IAiAgent'
import { AIAgentManager } from './ai-agent-mgr'
import { AIAgentConfig, AIModelConfig, StreamCallback, VideoStatusResponse } from './types'

/**
 * Mock Agent
 *
 * 注意和 env 的 isMock 不同，isMock 是完全离线的
 * mock agent用的是本地mock server
 */
export class MockAgent implements IAiAgent {
	agent: AIAgentManager
	config: AIAgentConfig = {
		baseUrl: 'http://localhost:3000/v1',
	}
	modelConfig: AIModelConfig = mockModelConfig
	axiosClient = axios.create({
		baseURL: this.config.baseUrl,
		timeout: 3000, // 3秒超时
	})

	constructor(agent: AIAgentManager) {
		this.agent = agent
	}

	private getHeaders() {
		return {
			Authorization: `Bearer ${this.config.apiKey || 'mock-token'}`,
			'Content-Type': 'application/json',
		}
	}

	async generateText(prompt: string) {
		try {
			const response = await this.axiosClient.post(
				'/chat/completions',
				{
					model: this.config.model,
					stream: false,
					messages: [{ role: 'user', content: prompt }],
					max_tokens: 1000,
				},
				{ headers: this.getHeaders() }
			)
			const content = response.data.choices[0]?.message?.content || ''
			return content.trim()
		} catch (error) {
			console.error('[MockAgent] generateText error', error)
			return ''
		}
	}

	async generateTextStream(prompt: string, onChunk: StreamCallback) {
		const { baseUrl } = this.config

		try {
			const response = await fetch(`${baseUrl}/chat/completions-stream`, {
				method: 'POST',
				headers: this.getHeaders(),
				body: JSON.stringify({
					model: this.config.model,
					stream: true,
					messages: [{ role: 'user', content: prompt }],
					max_tokens: 1000,
				}),
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const reader = response.body?.getReader()
			const decoder = new TextDecoder()
			let fullContent = ''

			const parser = createParser({
				onEvent: (event) => {
					if (event.data === '[DONE]') return
					try {
						const parsed = JSON.parse(event.data)
						const content = parsed.choices?.[0]?.delta?.content || ''
						if (content) {
							fullContent += content
							onChunk(content)
						}
					} catch (e) {
						// 忽略解析错误
					}
				},
			})

			while (true) {
				const { done, value } = await reader!.read()
				if (done) break
				const chunk = decoder.decode(value, { stream: true })
				parser.feed(chunk)
			}

			return fullContent
		} catch (error) {
			console.error('[MockAgent] generateTextStream error', error)
			return ''
		}
	}

	async generateImages(prompt: string) {
		try {
			const response = await this.axiosClient.post(
				'/images/generations',
				{
					model: this.config.model,
					prompt: prompt,
					image_size: '1024x1024',
					batch_size: 1,
					num_inference_steps: 20,
					guidance_scale: 7.5,
				},
				{ headers: this.getHeaders() }
			)

			return response.data.data.map((item: any) => item.url)
		} catch (error) {
			console.error('[MockAgent] generateImages error', error)
			return []
		}
	}

	async generateVideos(prompt: string, options?: { image_size?: string; negative_prompt?: string; image?: string }) {
		try {
			// 创建视频任务
			const requestId = await this.createVideoTask(prompt, options)

			// 轮询状态，最多15分钟（900秒），每10秒查询一次
			const maxPollingTime = 15 * 60 * 1000 // 15分钟
			const pollingInterval = 10 * 1000 // 10秒
			const startTime = Date.now()

			while (Date.now() - startTime < maxPollingTime) {
				// 查询状态
				const status = await this.getVideoTaskStatus(requestId)

				if (status.status === 'Succeed') {
					return status.results.videos.map((video) => video.url)
				}

				if (status.status === 'Failed') {
					throw new Error(status.reason || '视频生成失败')
				}

				// 等待10秒后再次查询
				await new Promise((resolve) => setTimeout(resolve, pollingInterval))
			}

			// 超时
			throw new Error('视频生成超时（15分钟）')
		} catch (error) {
			console.error('[MockAgent] generateVideos error', error)
			return []
		}
	}

	async createVideoTask(prompt: string, options?: { image_size?: string; negative_prompt?: string; image?: string }) {
		// 设置默认值
		const image_size = options?.image_size || '1280x720'
		const model = 'mock-video-model'

		// 构建请求参数
		const requestData = {
			model,
			prompt,
			image_size: image_size as '1280x720' | '720x1280' | '960x960',
			negative_prompt: options?.negative_prompt,
			image: options?.image,
		}

		// 提交视频生成请求
		const submitResponse = await this.axiosClient.post('/video/submit', requestData, { headers: this.getHeaders() })
		return submitResponse.data.requestId
	}

	async getVideoTaskStatus(requestId: string) {
		// 查询状态
		const statusResponse = await this.axiosClient.post<VideoStatusResponse>('/video/status', { requestId }, { headers: this.getHeaders() })

		return statusResponse.data
	}
}

export const mockModelConfig: AIModelConfig = {
	text: ['mock-text-model-1', 'mock-text-model-2', 'mock-gpt-4', 'mock-claude-3', 'mock-deepseek'],
	image: ['mock-image-model', 'mock-dalle-3', 'mock-midjourney'],
	video: ['mock-video-model', 'mock-sora', 'mock-runway'],
}
