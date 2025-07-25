import { storage } from '@/utils/storage'
import { AIPlatform, PlatformConfig } from './types'

class AIAgentConfig {

	data: Record<AIPlatform, PlatformConfig> = {
		[AIPlatform.Unknown]: {
			apiKey: 'unknown-token',
			baseUrl: 'unknown-url',
			models: {},
		},
		[AIPlatform.Mock]: {
			apiKey: 'mock-token',
			// NOTE: openai并不会拼接v1，虽然很多人都喜欢加这个前缀
			baseUrl: 'http://localhost:3000/v1',
			models: {
				text: ['mock-text-model-1', 'mock-text-model-2', 'mock-gpt-4', 'mock-claude-3', 'mock-deepseek'],
				image: ['mock-image-model', 'mock-dalle-3', 'mock-midjourney'],
				video: ['mock-video-model', 'mock-sora', 'mock-runway'],
			},
		},
		[AIPlatform.Silicon]: {
			apiKey: import.meta.env.VITE_SILICON_API_KEY || '',
			// NOTE： silicon 貌似做了兼容，是否包含 v1 其实都可以
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
					// == free models ==
					'deepseek/deepseek-chat-v3-0324:free',
					'deepseek/deepseek-r1:free',
					'deepseek/deepseek-chat:free',
					'tencent/hunyuan-a13b-instruct:free',
					'moonshotai/kimi-dev-72b:free',
					'deepseek/deepseek-r1-0528-qwen3-8b:free',
					'deepseek/deepseek-r1-0528:free',
					'qwen/qwen3-4b:free',

					// 'anthropic/claude-3.5-sonnet',
					// 'anthropic/claude-3-haiku',
					// 'openai/gpt-4o',
					// 'openai/gpt-4o-mini',
					// 'openai/gpt-3.5-turbo',
					// 'google/gemini-pro',
					// 'google/gemini-flash-1.5',
					// 'meta-llama/llama-3.1-8b-instruct',
					// 'meta-llama/llama-3.1-70b-instruct',
					// 'qwen/qwen-2.5-7b-instruct',
					// 'mistralai/mistral-7b-instruct',
					// 'cohere/command-r-plus',
				],
			},
		},
		[AIPlatform.DashScope]: {
			apiKey: import.meta.env.VITE_DASHSCOPE_API_KEY || '',
			baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
			models: {
				text: [
					'qwen-turbo',
					'qwen-turbo-latest',
					'qwen-plus',
					'qwen-plus-latest',
					'qwen-max',
					'qwen-max-longcontext',
					'qwen2.5-72b-instruct',
					'qwen2.5-32b-instruct',
					'qwen2.5-14b-instruct',
					'qwen2.5-7b-instruct',
					'qwen2.5-3b-instruct',
					'qwen2.5-1.5b-instruct',
					'qwen2.5-0.5b-instruct',
				],
				image: ['wanx-v1', 'flux-dev', 'flux-schnell'],
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
		const apiKeys: Partial<Record<AIPlatform, string>> = {}
		for (const platform in this.data) {
			if (platform === AIPlatform.Unknown) continue
			apiKeys[platform as AIPlatform] = this.data[platform as AIPlatform].apiKey
		}
		storage.setAppData({ apiKeys })
	}

	restore() {
		const appData = storage.getAppData()
		const apiKeys = appData.apiKeys || {}
		for (const platform in apiKeys) {
			if (this.data[platform as AIPlatform] && apiKeys[platform as AIPlatform]) {
				this.data[platform as AIPlatform].apiKey = apiKeys[platform as AIPlatform]!
			}
		}
	}
}

export const aiAgentConfig = new AIAgentConfig()
