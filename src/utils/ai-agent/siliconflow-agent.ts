import axios from 'axios'
import { createParser } from 'eventsource-parser'
import { IAiAgent } from './IAiAgent'
import { AIAgentManager } from './ai-agent-mgr'
import { StreamCallback, VideoStatusResponse, AIPlatform } from './types'
import { aiAgentConfig } from './ai-agent-config'

export class SiliconFlowAgent implements IAiAgent {
	agent: AIAgentManager
	axiosClient = axios.create({
		baseURL: aiAgentConfig.data[AIPlatform.Silicon].baseUrl,
		timeout: 3000,
	})
	currModel: string

	constructor(agent: AIAgentManager) {
		this.agent = agent
	}

	private getHeaders() {
		return {
			Authorization: `Bearer ${aiAgentConfig.getApiKey(AIPlatform.Silicon)}`,
			'Content-Type': 'application/json',
		}
	}

	async generateText(prompt: string) {
		try {
			const response = await this.axiosClient.post(
				'/chat/completions',
				{
					model: this.currModel,
					stream: false,
					messages: [{ role: 'user', content: prompt }],
					max_tokens: 1000,
				},
				{ headers: this.getHeaders() }
			)
			const content = response.data.choices[0]?.message?.content || ''
			return content.trim()
		} catch (error) {
			console.error('[SiliconFlowAgent] generateText error', error)
			return ''
		}
	}

	async generateTextStream(prompt: string, onChunk: StreamCallback) {
		try {
			const response = await fetch(`${aiAgentConfig.data[AIPlatform.Silicon].baseUrl}/chat/completions`, {
				method: 'POST',
				headers: this.getHeaders(),
				body: JSON.stringify({
					model: this.currModel,
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
			let hasValidContent = false

			const parser = createParser({
				onEvent: (event) => {
					if (event.data === '[DONE]') return
					try {
						const parsed = JSON.parse(event.data)
						const content: string = parsed.choices[0]?.delta?.content
						if (content) {
							if (!hasValidContent) {
								if (content.trim().length > 0) {
									hasValidContent = true
									const trimmedContent = content.trimStart()
									onChunk(trimmedContent)
									fullContent += trimmedContent
								}
							} else {
								onChunk(content)
								fullContent += content
							}
						}
					} catch (e) {
						// ignore
					}
				},
			})

			if (reader) {
				while (true) {
					const { done, value } = await reader.read()
					if (done) break
					const chunk = decoder.decode(value)
					parser.feed(chunk)
				}
			}

			return fullContent
		} catch (error) {
			console.error('[SiliconFlowAgent] generateTextStream error', error)
			return ''
		}
	}

	async generateImages(prompt: string) {
		try {
			const response = await axios.post(
				`${aiAgentConfig.data[AIPlatform.Silicon].baseUrl}/images/generations`,
				{
					model: this.currModel,
					prompt: prompt,
					image_size: '1024x1024',
					batch_size: 1,
					num_inference_steps: 20,
					guidance_scale: 7.5,
				},
				{ headers: this.getHeaders() }
			)

			return response.data.images.map((item: any) => item.url)
		} catch (error) {
			console.error('[SiliconFlowAgent] generateImages error', error)
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
			console.error('[SiliconFlowAgent] generateVideos error', error)
			return []
		}
	}

	async createVideoTask(prompt: string, options?: { image_size?: string; negative_prompt?: string; image?: string }) {
		// 设置默认值
		const image_size = options?.image_size || '1280x720'
		const model = 'Wan-AI/Wan2.1-T2V-14B'

		// 构建请求参数
		const requestData = {
			model,
			prompt,
			image_size: image_size as '1280x720' | '720x1280' | '960x960',
			negative_prompt: options?.negative_prompt,
			image: options?.image,
		}

		// 提交视频生成请求
		const submitResponse = await axios.post(`${aiAgentConfig.data[AIPlatform.Silicon].baseUrl}/video/submit`, requestData, { headers: this.getHeaders() })
		return submitResponse.data.requestId
	}

	async getVideoTaskStatus(requestId: string) {
		// 查询状态
		const statusResponse = await axios.post<VideoStatusResponse>(`${aiAgentConfig.data[AIPlatform.Silicon].baseUrl}/video/status`, { requestId }, { headers: this.getHeaders() })

		return statusResponse.data
	}
}
