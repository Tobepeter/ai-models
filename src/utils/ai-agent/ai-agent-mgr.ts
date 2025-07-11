import { IAiAgent } from './IAiAgent'
import { SiliconFlowAgent } from './siliconflow-agent'
import { MockAgent } from './mock-agent'
import { AIAgentConfig, AIPlatform, StreamCallback, VideoStatusResponse } from './types'

/**
 * AI Agent 单例管理器
 */
export class AIAgentManager {
	agent: IAiAgent
	agentMap: Record<AIPlatform, new (agent: AIAgentManager) => IAiAgent> = {
		[AIPlatform.Silicon]: SiliconFlowAgent,
		[AIPlatform.Mock]: MockAgent,
	}
	agentCache = {} as Record<AIPlatform, IAiAgent>

	switchPlatform(platform: AIPlatform) {
		if (this.agentCache[platform]) {
			this.agent = this.agentCache[platform]
		} else {
			this.agent = new this.agentMap[platform](this)
			this.agentCache[platform] = this.agent
		}
	}

	setConfig(config: AIAgentConfig) {
		this.agent.config = { ...this.agent.config, ...config }
	}

	async generateText(prompt: string) {
		if (!this.checkValid()) return ''
		return this.agent.generateText(prompt)
	}

	async generateTextStream(prompt: string, onChunk: StreamCallback) {
		if (!this.checkValid()) return ''
		return this.agent.generateTextStream(prompt, onChunk)
	}

	async generateImages(prompt: string) {
		if (!this.checkValid()) return []
		return this.agent.generateImages(prompt)
	}

	async generateVideos(prompt: string, options?: { image_size?: string; negative_prompt?: string; image?: string }) {
		if (!this.checkValid()) return []
		return this.agent.generateVideos(prompt, options)
	}

	async createVideoTask(prompt: string, options?: { image_size?: string; negative_prompt?: string; image?: string }) {
		if (!this.checkValid()) return ''
		return this.agent.createVideoTask(prompt, options)
	}

	async getVideoTaskStatus(requestId: string): Promise<VideoStatusResponse | null> {
		if (!this.checkValid()) return null
		return this.agent.getVideoTaskStatus(requestId)
	}

	checkValid() {
		if (!this.agent) {
			console.error('AI Agent is not initialized')
			return false
		}

		let valid = false
		if (this.agent.isValid) {
			valid = this.agent.isValid()
		} else {
			valid = !!(this.agent.config.apiKey && this.agent.config.baseUrl)
		}

		if (!valid) {
			console.error('AI Agent is not valid')
			return false
		}

		return true
	}
}

export const aiAgentMgr = new AIAgentManager()
