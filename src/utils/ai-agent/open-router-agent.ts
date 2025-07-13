import axios from 'axios'
import { createParser } from 'eventsource-parser'
import { IAiAgent } from './IAiAgent'
import { AIAgentManager } from './ai-agent-mgr'
import { StreamCallback, VideoStatusResponse, AIPlatform } from './types'
import { aiAgentConfig } from './ai-agent-config'

/**
 * OpenRouter AI Agent 实现
 */
export class OpenRouterAgent implements IAiAgent {
	agent: AIAgentManager
	axiosClient = axios.create({
		baseURL: aiAgentConfig.data[AIPlatform.OpenRouter].baseUrl,
		timeout: 30000, // OpenRouter 可能需要更长的超时时间
	})
	currModel: string

	constructor(agent: AIAgentManager) {
		this.agent = agent
	}

	private getHeaders() {
		return {
			Authorization: `Bearer ${aiAgentConfig.getApiKey(AIPlatform.OpenRouter)}`,
			'Content-Type': 'application/json',
			'HTTP-Referer': window.location.origin,
			'X-Title': 'AI Models Demo',
		}
	}

	async generateText(prompt: string) {
		try {
			const model = this.currModel
			const response = await this.axiosClient.post(
				'/chat/completions',
				{
					model,
					messages: [{ role: 'user', content: prompt }],
					max_tokens: 1000,
					stream: false,
				},
				{ headers: this.getHeaders() }
			)
			const content = response.data.choices[0]?.message?.content || ''
			return content.trim()
		} catch (error) {
			console.error('[OpenRouterAgent] generateText error', error)
			return ''
		}
	}

	async generateTextStream(prompt: string, onChunk: StreamCallback) {
		try {
			const model = this.currModel
			const response = await fetch(`${aiAgentConfig.data[AIPlatform.OpenRouter].baseUrl}/chat/completions`, {
				method: 'POST',
				headers: this.getHeaders(),
				body: JSON.stringify({
					model,
					messages: [{ role: 'user', content: prompt }],
					max_tokens: 1000,
					stream: true,
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
						// ignore parse errors
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
			console.error('[OpenRouterAgent] generateTextStream error', error)
			return ''
		}
	}

	async generateImages(_prompt: string) {
		/* OpenRouter 图像生成暂未实现 */
		console.warn('[OpenRouterAgent] generateImages not implemented')
		return []
	}

	async generateVideos(_prompt: string, _options?: any) {
		/* OpenRouter 视频生成暂未实现 */
		console.warn('[OpenRouterAgent] generateVideos not implemented')
		return []
	}

	async createVideoTask(_prompt: string, _options?: { image_size?: string; negative_prompt?: string; image?: string }): Promise<string> {
		/* OpenRouter 视频任务创建暂未实现 */
		console.warn('[OpenRouterAgent] createVideoTask not implemented')
		throw new Error('createVideoTask not implemented for OpenRouter')
	}

	async getVideoTaskStatus(_requestId: string): Promise<VideoStatusResponse> {
		/* OpenRouter 视频任务状态查询暂未实现 */
		console.warn('[OpenRouterAgent] getVideoTaskStatus not implemented')
		throw new Error('getVideoTaskStatus not implemented for OpenRouter')
	}
}
