import { AIAgentConfig, AIModelConfig } from './types'
import { AIAgentManager } from './ai-agent-mgr'

export interface IAiAgent {
	agent: AIAgentManager
	config: AIAgentConfig
	modelConfig?: AIModelConfig

	generateText: (prompt: string) => Promise<string>
	generateTextStream: (prompt: string, onChunk: (chunk: string) => void) => Promise<string>
	generateImage: (prompt: string) => Promise<string>

	isValid?: () => boolean
}
