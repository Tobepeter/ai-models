import axios from 'axios'
import { IAiAgent } from './IAiAgent'
import { AIAgentManager } from './ai-agent-mgr'
import { AIAgentConfig, AIModelConfig, StreamCallback, VideoStatusResponse } from './types'

/**
 * SiliconFlow
 */
export class SiliconFlowAgent implements IAiAgent {
	agent: AIAgentManager
	config: AIAgentConfig = {
		baseUrl: 'https://api.siliconflow.cn/v1',
	}
	modelConfig: AIModelConfig = siliconflowModelConfig

	constructor(agent: AIAgentManager) {
		this.agent = agent
	}

	private getHeaders() {
		return {
			Authorization: `Bearer ${this.config.apiKey}`,
			'Content-Type': 'application/json',
		}
	}

	async generateText(prompt: string) {
		this.agent.setRunning(true)

		try {
			const { baseUrl } = this.config
			const response = await axios.post(
				`${baseUrl}/chat/completions`,
				{
					model: this.config.model,
					stream: false,
					messages: [{ role: 'user', content: prompt }],
					max_tokens: 1000,
				},
				{ headers: this.getHeaders() }
			)

			this.agent.setRunning(false)
			return response.data.choices[0]?.message?.content || ''
		} catch (error) {
			this.agent.setRunning(false)
			throw error
		}
	}

	async generateTextStream(prompt: string, onChunk: StreamCallback) {
		this.agent.setRunning(true)
		const { baseUrl } = this.config

		try {
			const response = await fetch(`${baseUrl}/chat/completions`, {
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

			if (reader) {
				while (true) {
					const { done, value } = await reader.read()
					if (done) break

					const chunk = decoder.decode(value)
					const lines = chunk.split('\n')

					for (const line of lines) {
						if (line.startsWith('data: ')) {
							const data = line.slice(6).trim()
							if (data === '[DONE]') continue

							try {
								const parsed = JSON.parse(data)
								const content = parsed.choices[0]?.delta?.content
								if (content) {
									fullContent += content
									onChunk(content)
								}
							} catch (e) {
								// 忽略解析错误
							}
						}
					}
				}
			}

			this.agent.setRunning(false)
			return fullContent
		} catch (error) {
			this.agent.setRunning(false)
			throw error
		}
	}

	async generateImage(prompt: string) {
		this.agent.setRunning(true)
		const { baseUrl } = this.config

		try {
			const response = await axios.post(
				`${baseUrl}/images/generations`,
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

			this.agent.setRunning(false)
			return response.data.images
		} catch (error) {
			this.agent.setRunning(false)
			throw error
		}
	}

	async generateVideo(prompt: string, options?: { image_size?: string; negative_prompt?: string; image?: string }) {
		this.agent.setRunning(true)

		try {
			// 创建视频任务
			const requestId = await this.createVideoTask(prompt, options)

			// 轮询状态，最多15分钟（900秒），每10秒查询一次
			const maxPollingTime = 15 * 60 * 1000 // 15分钟
			const pollingInterval = 10 * 1000 // 10秒
			const startTime = Date.now()

			while (Date.now() - startTime < maxPollingTime) {
				// 检查是否已停止
				if (!this.agent.isRunning) {
					throw new Error('视频生成已取消')
				}

				// 查询状态
				const status = await this.getVideoTaskStatus(requestId)

				if (status.status === 'Succeed' && status.results?.videos?.[0]?.url) {
					this.agent.setRunning(false)
					return status.results.videos[0].url
				}

				if (status.status === 'Failed') {
					this.agent.setRunning(false)
					throw new Error(status.reason || '视频生成失败')
				}

				// 等待10秒后再次查询
				await new Promise((resolve) => setTimeout(resolve, pollingInterval))
			}

			// 超时
			this.agent.setRunning(false)
			throw new Error('视频生成超时（15分钟）')
		} catch (error) {
			this.agent.setRunning(false)
			throw error
		}
	}

	async createVideoTask(prompt: string, options?: { image_size?: string; negative_prompt?: string; image?: string }) {
		const { baseUrl } = this.config

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
		const submitResponse = await axios.post(`${baseUrl}/video/submit`, requestData, { headers: this.getHeaders() })
		return submitResponse.data.requestId
	}

	async getVideoTaskStatus(requestId: string) {
		const { baseUrl } = this.config

		// 查询状态
		const statusResponse = await axios.post<VideoStatusResponse>(
			`${baseUrl}/video/status`,
			{ requestId },
			{ headers: this.getHeaders() }
		)

		return statusResponse.data
	}
}

export const siliconflowModelConfig: AIModelConfig = {
	text: [
		// == prettier break ==
		'deepseek-ai/DeepSeek-R1',
		'Pro/deepseek-ai/DeepSeek-R1',
		'THUDM/GLM-4.1V-9B-Thinking',
		'tencent/Hunyuan-A13B-Instruct',
		'Qwen/Qwen3-32B',
	],
	image: ['Kwai-Kolors/Kolors'],
	video: ['Wan-AI/Wan2.1-T2V-14B'],
}
