import { AIAgentConfig, AIModelConfig, VideoStatusResponse } from './types'
import { AIAgentManager } from './ai-agent-mgr'

export interface IAiAgent {
	agent: AIAgentManager
	config: AIAgentConfig
	modelConfig?: AIModelConfig

	generateText: (prompt: string) => Promise<string>
	generateTextStream: (prompt: string, onChunk: (chunk: string) => void) => Promise<string>
	generateImages: (prompt: string) => Promise<string[]>
	generateVideos: (prompt: string, options?: { image_size?: string; negative_prompt?: string; image?: string }) => Promise<string[]>
	createVideoTask: (prompt: string, options?: { image_size?: string; negative_prompt?: string; image?: string }) => Promise<string>
	getVideoTaskStatus: (requestId: string) => Promise<VideoStatusResponse>

	isValid?: () => boolean
}
