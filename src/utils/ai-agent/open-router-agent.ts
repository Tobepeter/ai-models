import OpenAI from 'openai'
import { IAiAgent } from './IAiAgent'
import { AIAgentManager } from './ai-agent-mgr'
import { StreamCallback, VideoStatusResponse, AIPlatform } from './types'
import { aiAgentConfig } from './ai-agent-config'
import { requestConfig } from '@/config/request-config'

/**
 * OpenRouter
 */
export class OpenRouterAgent implements IAiAgent {
	agent: AIAgentManager
	openai: OpenAI
	currModel: string

	constructor(agent: AIAgentManager) {
		this.agent = agent
		this.openai = new OpenAI({
			baseURL: aiAgentConfig.data[AIPlatform.OpenRouter].baseUrl,
			apiKey: 'placeholder', // 使用占位符，实际鉴权通过 headers 传递
			timeout: requestConfig.chatTimeout,
			dangerouslyAllowBrowser: true,
		})
	}

	private getHeaders() {
		return {
			Authorization: `Bearer ${aiAgentConfig.getApiKey(AIPlatform.OpenRouter)}`,
			'Content-Type': 'application/json',
		}
	}

	async generateText(prompt: string) {
		try {
			const response = await this.openai.chat.completions.create(
				{
					model: this.currModel,
					messages: [{ role: 'user', content: prompt }],
					max_tokens: 1000,
					stream: false,
				},
				{
					headers: this.getHeaders(),
				}
			)
			const content = response.choices[0]?.message?.content || ''
			return content.trim()
		} catch (error) {
			console.error('[OpenRouterAgent] generateText error', error)
			return ''
		}
	}

	async genTextStream(prompt: string, onChunk: StreamCallback) {
		try {
			const stream = await this.openai.chat.completions.create(
				{
					model: this.currModel,
					messages: [{ role: 'user', content: prompt }],
					max_tokens: 1000,
					stream: true,
				},
				{
					headers: this.getHeaders(),
				}
			)

			let fullContent = ''
			let hasValidContent = false

			for await (const chunk of stream) {
				const content = chunk.choices[0]?.delta?.content || ''
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
			console.error('[OpenRouterAgent] genTextStream error', error)
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
