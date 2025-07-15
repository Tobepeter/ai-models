import { create } from 'zustand'
import { chatHubHelper } from './chat-hub-helper'
import { chatHubMgr } from './chat-hub-mgr'
import { ChatHubCard, ChatHubModel } from './chat-hub-type'

export interface ChatHubStore {
	// 全局状态
	isGenerating: boolean
	models: ChatHubModel[] // 全部模型列表
	currentQuestion: string
	cards: ChatHubCard[]

	// 操作方法
	toggleModel: (modelId: string) => void // 切换模型启用状态
	startGeneration: (question: string) => Promise<void>
	stopGeneration: () => void
	addCard: (card: ChatHubCard) => void
	updateCard: (cardId: string, updates: Partial<ChatHubCard>) => void
	reset: () => void
}

export const useChatHubStore = create<ChatHubStore>((set, get) => ({
	isGenerating: false,
	models: chatHubHelper.getModels(), // 全部模型列表
	currentQuestion: '',
	cards: [],

	toggleModel: (modelId) => {
		const { models } = get()
		const updatedModels = models.map((model) => (model.id === modelId ? { ...model, enabled: !model.enabled } : model))
		set({
			models: updatedModels,
		})
	},

	startGeneration: async (question) => {
		const { models } = get()
		const selectedModels = models.filter((m) => m.enabled)
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
