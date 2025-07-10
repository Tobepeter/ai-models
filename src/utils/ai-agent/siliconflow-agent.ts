import axios from 'axios'
import { IAiAgent } from './IAiAgent'
import { AIAgentManager } from './ai-agent-mgr'
import { AIAgentConfig, AIModelConfig, StreamCallback } from './types'

/**
 * SiliconFlow
 */
export class SiliconFlowAgent implements IAiAgent {
	agent: AIAgentManager
	config: AIAgentConfig
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
				`${baseUrl}/v1/chat/completions`,
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
			const response = await fetch(`${baseUrl}/v1/chat/completions`, {
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
				`${baseUrl}/v1/images/generations`,
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
}
