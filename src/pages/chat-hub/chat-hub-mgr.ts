import { AIAgentManager } from '@/utils/ai-agent/ai-agent-mgr'
import { AIPlatform } from '@/utils/ai-agent/types'
import { v4 as uuidv4 } from 'uuid'
import { useChatHubStore } from './chat-hub-store'
import { ChatHubCard, ChatHubModel } from './chat-hub-type'

class ChatHubManager {
	// 缓存 platform+model 为一个agent实例
	private agentCache = new Map<string, AIAgentManager>()
	async startGeneration(question: string, models: ChatHubModel[]) {
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

	// 获取或创建agent实例
	private getAgent(platform: string, model: string): AIAgentManager {
		const cacheKey = `${platform}-${model}`

		if (!this.agentCache.has(cacheKey)) {
			const agent = new AIAgentManager()
			// 根据platform设置对应的平台
			const platformEnum = platform === 'mock' ? AIPlatform.Mock : platform === 'silicon' ? AIPlatform.Silicon : platform === 'openrouter' ? AIPlatform.OpenRouter : AIPlatform.Unknown

			agent.switchPlatform(platformEnum)
			agent.setModel(model)

			this.agentCache.set(cacheKey, agent)
		}

		return this.agentCache.get(cacheKey)!
	}

	private async generateForModel(question: string, model: ChatHubModel) {
		const store = useChatHubStore.getState()

		// 创建新卡片
		const cardId = uuidv4()
		const newCard: ChatHubCard = {
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

			// 获取对应的agent实例
			const agent = this.getAgent(model.platform, model.model)

			let fullAnswer = ''
			let isFirstChunk = true

			// 流式生成
			await agent.generateTextStream(question, (chunk: string) => {
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

	// 清空agent缓存，组件unmount时调用
	clearCache() {
		this.agentCache.clear()
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
