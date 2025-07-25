import OpenAI from 'openai'
import axios from 'axios'
import { IAiAgent } from './IAiAgent'
import { AIAgentManager } from './ai-agent-mgr'
import { StreamCallback, VideoStatusResponse, AIPlatform, MediaType } from './types'
import { aiAgentConfig } from './ai-agent-config'
import { requestConfig } from '@/config/request-config'

/**
 * Mock Agent
 *
 * 注意和 env 的 isMock 不同，isMock 是完全离线的
 * mock agent用的是本地mock server
 */
export class MockAgent implements IAiAgent {
	agent: AIAgentManager
	openai: OpenAI
	axiosClient = axios.create({
		baseURL: 'http://localhost:3000',
		timeout: requestConfig.chatTimeout,
	})
	currModel: string

	constructor(agent: AIAgentManager) {
		this.agent = agent
		this.openai = new OpenAI({
			baseURL: aiAgentConfig.data[AIPlatform.Mock].baseUrl,
			apiKey: aiAgentConfig.getApiKey(AIPlatform.Mock),
			timeout: requestConfig.chatTimeout,
			dangerouslyAllowBrowser: true,
		})
	}

	private getHeaders() {
		return {
			Authorization: `Bearer ${aiAgentConfig.getApiKey(AIPlatform.Mock)}`,
			'Content-Type': 'application/json',
		}
	}

	async generateText(prompt: string) {
		try {
			const response = await this.openai.chat.completions.create({
				model: this.currModel,
				messages: [{ role: 'user', content: prompt }],
				max_tokens: 1000,
				stream: false,
			})
			const content = response.choices[0]?.message?.content || ''
			return content.trim()
		} catch (error) {
			console.error('[MockAgent] generateText error', error)
			return ''
		}
	}

	async genTextStream(prompt: string, onChunk: StreamCallback) {
		try {
			const stream = await this.openai.chat.completions.create({
				model: this.currModel,
				messages: [{ role: 'user', content: prompt }],
				max_tokens: 1000,
				stream: true,
			})

			let fullContent = ''
			for await (const chunk of stream) {
				const content = chunk.choices[0]?.delta?.content || ''
				if (content) {
					fullContent += content
					onChunk(content)
				}
			}

			return fullContent
		} catch (error) {
			console.error('[MockAgent] genTextStream error', error)
			return ''
		}
	}

	async generateImages(prompt: string) {
		try {
			const response = await this.openai.images.generate({
				model: 'dall-e-3',
				prompt: prompt,
				size: '1024x1024',
				quality: 'standard',
				n: 1,
			})

			return response.data.map((item) => item.url).filter(Boolean) as string[]
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

		// 构建请求参数
		const requestData = {
			model: this.currModel,
			prompt,
			image_size: image_size as '1280x720' | '720x1280' | '960x960',
			negative_prompt: options?.negative_prompt,
			image: options?.image,
		}

		// 提交视频生成请求
		const submitResponse = await this.axiosClient.post('/v1/video/submit', requestData, { headers: this.getHeaders() })
		return submitResponse.data.requestId
	}

	async getVideoTaskStatus(requestId: string) {
		// 查询状态
		const statusResponse = await this.axiosClient.post<VideoStatusResponse>('/v1/video/status', { requestId }, { headers: this.getHeaders() })

		return statusResponse.data
	}
}
