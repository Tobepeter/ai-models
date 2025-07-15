import { ChatHubModel } from './chat-hub-type'
import { aiAgentConfig } from '@/utils/ai-agent/ai-agent-config'
import { AIPlatform } from '@/utils/ai-agent/types'
import { isDev } from '@/utils/env'

class ChatHubHelper {
	getModels() {
		const results: ChatHubModel[] = []

		// mock
		if (isDev) {
			aiAgentConfig.data[AIPlatform.Mock].models.text.forEach((model, idx) => {
				results.push({
					id: `mock-text-${idx}`,
					platform: 'mock',
					model: model,
					name: model
						.replace('mock-', 'Mock ')
						.replace('-', ' ')
						.replace(/\b\w/g, (l) => l.toUpperCase()),
					enabled: false,
				})
			})
		}

		// silicon
		aiAgentConfig.data[AIPlatform.Silicon].models.text.forEach((model, idx) => {
			results.push({
				id: `silicon-text-${idx}`,
				platform: 'silicon',
				model: model,
				name: model.split('/').pop() || model, // 取最后一部分作为显示名称
				enabled: false,
			})
		})

		// open-router
		aiAgentConfig.data[AIPlatform.OpenRouter].models.text.forEach((model, idx) => {
			results.push({
				id: `openrouter-text-${idx}`,
				platform: 'openrouter',
				model: model,
				name: model.split('/').pop() || model, // 取最后一部分作为显示名称
				enabled: false,
			})
		})

		return results
	}
}

export const chatHubHelper = new ChatHubHelper()
