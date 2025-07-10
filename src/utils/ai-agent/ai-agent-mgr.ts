import { IAiAgent } from './IAiAgent'
import { SiliconFlowAgent } from './siliconflow-agent'
import { AIAgentConfig, AIPlatform, StreamCallback } from './types'

/**
 * AI Agent 单例管理器
 */
export class AIAgentManager {
	agent: IAiAgent
	isRunning = false

	switchPlatform(platform: AIPlatform) {
		switch (platform) {
			case AIPlatform.Silicon:
				this.agent = new SiliconFlowAgent(this)
				break
			default:
				throw new Error(`Unsupported platform: ${platform}`)
		}
	}

	setConfig(config: AIAgentConfig) {
		this.agent.config = config
	}

	setRunning(isRunning: boolean) {
		this.isRunning = isRunning
	}

	async generateText(prompt: string) {
		if (!this.checkValid()) return ''
		return this.agent.generateText(prompt)
	}

	async generateTextStream(prompt: string, onChunk: StreamCallback) {
		if (!this.checkValid()) return ''
		return this.agent.generateTextStream(prompt, onChunk)
	}

	async generateImage(prompt: string) {
		if (!this.checkValid()) return ''
		return this.agent.generateImage(prompt)
	}

	checkValid() {
		if (!this.isValid()) {
			console.error('AI Agent is not valid')
			return false
		}
		return true
	}

	isValid() {
		let valid = false
		if (this.agent.isValid) {
			valid = this.agent.isValid()
		} else {
			valid = !!(this.agent.config.apiKey && this.agent.config.baseUrl)
		}

		return valid
	}
}

export const aiAgentMgr = new AIAgentManager()
