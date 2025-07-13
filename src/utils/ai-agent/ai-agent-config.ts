import { AIPlatform, PlatformConfig } from './types'

class AIAgentConfig {
	storageKey = 'ai-agent-config'

	data: Record<AIPlatform, PlatformConfig> = {
		[AIPlatform.Unknown]: {
			apiKey: 'unknown-token',
			baseUrl: 'unknown-url',
			models: {},
		},
		[AIPlatform.Mock]: {
			apiKey: 'mock-token',
			baseUrl: 'http://localhost:3000/v1',
			models: {
				text: ['mock-text-model-1', 'mock-text-model-2', 'mock-gpt-4', 'mock-claude-3', 'mock-deepseek'],
				image: ['mock-image-model', 'mock-dalle-3', 'mock-midjourney'],
				video: ['mock-video-model', 'mock-sora', 'mock-runway'],
			},
		},
		[AIPlatform.Silicon]: {
			apiKey: import.meta.env.VITE_SILICON_API_KEY || '',
			baseUrl: 'https://api.siliconflow.cn/v1',
			models: {
				text: ['deepseek-ai/DeepSeek-R1', 'Pro/deepseek-ai/DeepSeek-R1', 'THUDM/GLM-4.1V-9B-Thinking', 'tencent/Hunyuan-A13B-Instruct', 'Qwen/Qwen3-32B'],
				image: ['Kwai-Kolors/Kolors'],
				video: ['Wan-AI/Wan2.1-T2V-14B'],
			},
		},
		[AIPlatform.OpenRouter]: {
			apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
			baseUrl: 'https://openrouter.ai/api/v1',
			models: {
				text: [
					'anthropic/claude-3.5-sonnet',
					'anthropic/claude-3-haiku',
					'openai/gpt-4o',
					'openai/gpt-4o-mini',
					'openai/gpt-3.5-turbo',
					'google/gemini-pro',
					'google/gemini-flash-1.5',
					'meta-llama/llama-3.1-8b-instruct',
					'meta-llama/llama-3.1-70b-instruct',
					'qwen/qwen-2.5-7b-instruct',
					'mistralai/mistral-7b-instruct',
					'cohere/command-r-plus',
				],
			},
		},
	}

	setApiKey(platform: AIPlatform, apiKey: string) {
		this.data[platform].apiKey = apiKey
	}

	getApiKey(platform: AIPlatform) {
		return this.data[platform].apiKey
	}

	save() {
		const apiKeys = {}
		for (const platform in this.data) {
			if (platform === AIPlatform.Unknown) continue
			apiKeys[platform] = this.data[platform].apiKey
		}
		localStorage.setItem(this.storageKey, JSON.stringify(apiKeys))
	}

	restore() {
		const apiKeys = localStorage.getItem(this.storageKey)
		if (apiKeys) {
			const savedData = JSON.parse(apiKeys)
			for (const platform in savedData) {
				this.data[platform].apiKey = savedData[platform]
			}
		}
	}
}

export const aiAgentConfig = new AIAgentConfig()
