import OpenAI from 'openai'
import axios from 'axios'
import { IAiAgent } from './IAiAgent'
import { AIAgentManager } from './ai-agent-mgr'
import { StreamCallback, VideoStatusResponse, AIPlatform } from './types'
import { aiAgentConfig } from './ai-agent-config'
import { requestConfig } from '@/config/request-config'

export class SiliconFlowAgent implements IAiAgent {
	agent: AIAgentManager
	openai: OpenAI
	axiosClient = axios.create({
		baseURL: aiAgentConfig.data[AIPlatform.Silicon].baseUrl,
		timeout: requestConfig.chatTimeout,
	})
	currModel: string

	constructor(agent: AIAgentManager) {
		this.agent = agent
		this.openai = new OpenAI({
			baseURL: aiAgentConfig.data[AIPlatform.Silicon].baseUrl,
			apiKey: 'placeholder', // 使用占位符，实际鉴权通过 headers 传递
			timeout: requestConfig.chatTimeout,
			dangerouslyAllowBrowser: true,
		})
	}

	private getHeaders() {
		// NOTE: apikey 可能动态获得，不能new openai时候传进去
		return {
			Authorization: `Bearer ${aiAgentConfig.getApiKey(AIPlatform.Silicon)}`,
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
			}, { 
				headers: this.getHeaders() 
			})
			let content = response.choices[0]?.message?.content || ''
			const reasoningContent = response.choices[0]?.message?.['reasoning_content'] || ''
			if (reasoningContent) {
				content = reasoningContent + content
			}
			return content.trim()
		} catch (error) {
			console.error('[SiliconFlowAgent] generateText error', error)
			return ''
		}
	}

	async generateTextStream(prompt: string, onChunk: StreamCallback) {
		try {
			const stream = await this.openai.chat.completions.create({
				model: this.currModel,
				messages: [{ role: 'user', content: prompt }],
				max_tokens: 1000,
				stream: true,
			}, { 
				headers: this.getHeaders() 
			})

			let fullContent = ''
			let hasValidContent = false

			for await (const chunk of stream) {
				// NOTE: deepseek 如果有reasoning_content，则优先使用
				const reasoningContent = chunk.choices[0]?.delta?.['reasoning_content'] || ''
				const content = chunk.choices[0]?.delta?.content || reasoningContent
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
			}

			return fullContent
		} catch (error) {
			console.error('[SiliconFlowAgent] generateTextStream error', error)
			return ''
		}
	}

	async generateImages(prompt: string) {
		try {
			const response = await this.openai.images.generate({
				model: this.currModel,
				prompt: prompt,
				size: '1024x1024',
				n: 1,
			}, { 
				headers: this.getHeaders() 
			})

			return response.data.map((item) => item.url).filter(Boolean) as string[]
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
