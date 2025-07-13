import { aiAgentConfig } from './ai-agent-config'
import { IAiAgent } from './IAiAgent'
import { MockAgent } from './mock-agent'
import { OpenRouterAgent } from './open-router-agent'
import { SiliconFlowAgent } from './siliconflow-agent'
import { AIPlatform, MediaType, PlatformConfig, StreamCallback, VideoStatusResponse } from './types'

/**
 * AI Agent
 */
export class AIAgentManager {
	agent: IAiAgent
	platform = AIPlatform.Unknown
	agentMap: Record<AIPlatform, new (agent: AIAgentManager) => IAiAgent> = {
		[AIPlatform.Unknown]: null,
		[AIPlatform.Silicon]: SiliconFlowAgent,
		[AIPlatform.OpenRouter]: OpenRouterAgent,
		[AIPlatform.Mock]: MockAgent,
	}
	agentCache = {} as Record<AIPlatform, IAiAgent>

	switchPlatform(platform: AIPlatform) {
		this.platform = platform

		if (!this.agentMap[platform]) {
			this.agent = null
			return
		}

		if (this.agentCache[platform]) {
			this.agent = this.agentCache[platform]
		} else {
			this.agent = new this.agentMap[platform](this)
			this.agentCache[platform] = this.agent
		}
	}

	setModel(model: string) {
		if (this.agent) this.agent.currModel = model
	}

	getModel(): string {
		return this.agent?.currModel || ''
	}

	getModelMedia(): MediaType {
		if (!this.agent) return 'text'

		const model = this.agent.currModel
		const platformConfig = aiAgentConfig.data[this.platform]
		if (!platformConfig?.models) return 'text'

		const modelConfig = platformConfig.models
		for (const mediaType in modelConfig) {
			const models = modelConfig[mediaType as MediaType]
			if (models && models.includes(model)) {
				return mediaType as MediaType
			}
		}
		return 'text'
	}

	getPlatformConfig(): PlatformConfig {
		return aiAgentConfig.data[this.platform]
	}

	async generateText(prompt: string) {
		return this.agent.generateText(prompt)
	}

	async generateTextStream(prompt: string, onChunk: StreamCallback) {
		return this.agent.generateTextStream(prompt, onChunk)
	}

	async generateImages(prompt: string) {
		return this.agent.generateImages(prompt)
	}

	async generateVideos(prompt: string, options?: { image_size?: string; negative_prompt?: string; image?: string }) {
		return this.agent.generateVideos(prompt, options)
	}

	async createVideoTask(prompt: string, options?: { image_size?: string; negative_prompt?: string; image?: string }) {
		return this.agent.createVideoTask(prompt, options)
	}

	async getVideoTaskStatus(requestId: string): Promise<VideoStatusResponse | null> {
		return this.agent.getVideoTaskStatus(requestId)
	}
}

export const aiAgentMgr = new AIAgentManager()
