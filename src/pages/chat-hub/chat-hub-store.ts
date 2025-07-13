import { create } from 'zustand'
import { ChatCard, ModelConfig } from './chat-hub-type'
import { aiAgentConfig } from '@/utils/ai-agent/ai-agent-config'
import { AIPlatform } from '@/utils/ai-agent/types'
import { chatHubMgr } from './chat-hub-mgr'

export interface ChatHubStore {
	// 全局状态
	isGenerating: boolean
	allModels: ModelConfig[] // 全部模型列表
	selectedModels: ModelConfig[] // 当前选中的模型
	currentQuestion: string
	cards: ChatCard[]

	// 操作方法
	setSelectedModels: (models: ModelConfig[]) => void
	toggleModel: (modelId: string) => void // 切换模型启用状态
	startGeneration: (question: string) => Promise<void>
	stopGeneration: () => void
	addCard: (card: ChatCard) => void
	updateCard: (cardId: string, updates: Partial<ChatCard>) => void
	reset: () => void
}

// 生成全部模型列表，用enable标记
const allModels: ModelConfig[] = []

// Mock平台模型
aiAgentConfig.data[AIPlatform.Mock].models.text.forEach((model, idx) => {
	allModels.push({
		id: `mock-text-${idx}`,
		platform: 'mock',
		model: model,
		name: model
			.replace('mock-', 'Mock ')
			.replace('-', ' ')
			.replace(/\b\w/g, (l) => l.toUpperCase()),
		enabled: idx < 3, // 默认启用前3个
	})
})

// Silicon平台模型
aiAgentConfig.data[AIPlatform.Silicon].models.text.forEach((model, idx) => {
	allModels.push({
		id: `silicon-text-${idx}`,
		platform: 'silicon',
		model: model,
		name: model.split('/').pop() || model, // 取最后一部分作为显示名称
		enabled: false, // 默认不启用
	})
})

// OpenRouter平台模型
aiAgentConfig.data[AIPlatform.OpenRouter].models.text.forEach((model, idx) => {
	allModels.push({
		id: `openrouter-text-${idx}`,
		platform: 'openrouter',
		model: model,
		name: model.split('/').pop() || model, // 取最后一部分作为显示名称
		enabled: false, // 默认不启用
	})
})

export const useChatHubStore = create<ChatHubStore>((set, get) => ({
	isGenerating: false,
	allModels: allModels, // 全部模型列表
	selectedModels: allModels.filter((m) => m.enabled), // 使用启用的模型
	currentQuestion: '',
	cards: [],

	setSelectedModels: (models) => {
		set({ selectedModels: models })
	},

	toggleModel: (modelId) => {
		const { allModels } = get()
		const updatedModels = allModels.map((model) => (model.id === modelId ? { ...model, enabled: !model.enabled } : model))
		const enabledModels = updatedModels.filter((m) => m.enabled)
		set({
			allModels: updatedModels,
			selectedModels: enabledModels,
		})
	},

	startGeneration: async (question) => {
		const { selectedModels } = get()
		if (!question.trim() || selectedModels.length === 0) return

		set({
			isGenerating: true,
			currentQuestion: question,
			cards: [], // 卡片将由 manager 创建
		})
		await chatHubMgr.startGeneration(question, selectedModels)
	},

	stopGeneration: () => {
		set({ isGenerating: false, cards: [] })
		chatHubMgr.stopGeneration()
	},

	addCard: (card) => {
		const { cards } = get()
		set({ cards: [...cards, card] })
	},

	updateCard: (cardId, updates) => {
		const { cards } = get()
		const updatedCards = cards.map((card) => (card.id === cardId ? { ...card, ...updates } : card))
		set({ cards: updatedCards })
	},

	reset: () => {
		set({
			isGenerating: false,
			currentQuestion: '',
			cards: [],
		})
	},
}))
