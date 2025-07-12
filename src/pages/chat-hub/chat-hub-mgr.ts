import { aiAgentMgr } from '@/utils/ai-agent/ai-agent-mgr'
import { AIPlatform } from '@/utils/ai-agent/types'
import { ChatCard, ModelConfig } from './chat-hub-type'
import { useChatHubStore } from './chat-hub-store'
import { v4 as uuidv4 } from 'uuid'

class ChatHubManager {
	async startGeneration(question: string, models: ModelConfig[]) {
		// 为每个模型启动生成任务
		const promises = models.map((model) => this.generateForModel(question, model))

		try {
			await Promise.allSettled(promises)
		} catch (error) {
			console.error('Generation error:', error)
		} finally {
			// 检查是否所有任务完成
			this.checkAllCompleted()
		}
	}

	private async generateForModel(question: string, model: ModelConfig) {
		const store = useChatHubStore.getState()

		// 创建新卡片
		const cardId = uuidv4()
		const newCard: ChatCard = {
			id: cardId,
			platform: model.platform,
			model: model.model,
			modelName: model.name,
			status: 'not-started',
			question,
			answer: '',
			timestamp: Date.now(),
		}
		store.addCard(newCard)

		try {
			// 更新状态为等待中
			store.updateCard(cardId, { status: 'pending' })

			// 设置AI平台和配置（目前只使用 Mock）
			aiAgentMgr.switchPlatform(AIPlatform.Mock)
			aiAgentMgr.setConfig({
				model: model.model,
				apiKey: 'mock-key',
			})

			let fullAnswer = ''
			let isFirstChunk = true

			// 流式生成
			await aiAgentMgr.generateTextStream(question, (chunk: string) => {
				// 第一次收到内容时，更新状态为生成中
				if (isFirstChunk) {
					store.updateCard(cardId, {
						status: 'generating',
						startTime: Date.now(),
					})
					isFirstChunk = false
				}

				fullAnswer += chunk
				store.updateCard(cardId, { answer: fullAnswer })
			})

			// 完成
			store.updateCard(cardId, {
				status: 'completed',
				endTime: Date.now(),
			})
		} catch (error) {
			store.updateCard(cardId, {
				status: 'error',
				error: error instanceof Error ? error.message : '生成失败',
			})
		}
	}

	stopGeneration() {
		// 停止生成（实际上请求会继续，但不会更新UI状态）
		const store = useChatHubStore.getState()
		store.reset()
	}

	private checkAllCompleted() {
		const store = useChatHubStore.getState()
		const allCompleted = store.cards.every((card) => card.status === 'completed' || card.status === 'error')

		if (allCompleted && store.isGenerating) {
			// 更新全局状态
			useChatHubStore.setState({ isGenerating: false })
		}
	}
}

export const chatHubMgr = new ChatHubManager()
