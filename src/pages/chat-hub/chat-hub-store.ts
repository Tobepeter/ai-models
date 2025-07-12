import { create } from 'zustand'
import { ChatCard, ModelConfig } from './chat-hub-type'
import { mockModelConfig } from '@/utils/ai-agent/mock-agent'

// Store接口
export interface ChatHubStore {
	// 全局状态
	isGenerating: boolean
	selectedModels: ModelConfig[]
	currentQuestion: string
	cards: ChatCard[]

	// 操作方法
	setSelectedModels: (models: ModelConfig[]) => void
	startGeneration: (question: string) => Promise<void>
	stopGeneration: () => void
	addCard: (card: ChatCard) => void
	updateCard: (cardId: string, updates: Partial<ChatCard>) => void
	reset: () => void
}

// 从 mock-agent 生成默认模型配置，只激活前3个文本模型
const defaultModels: ModelConfig[] = []

// 只添加前3个文本模型作为默认激活
mockModelConfig.text.slice(0, 3).forEach((model, idx) => {
	defaultModels.push({
		id: `text-${idx}`,
		platform: 'mock',
		model: model,
		name: model.replace('mock-', 'Mock ').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
	})
})

export const useChatHubStore = create<ChatHubStore>((set, get) => ({
	isGenerating: false,
	selectedModels: defaultModels, // 直接使用默认模型，不需要过滤
	currentQuestion: '',
	cards: [],

	setSelectedModels: (models) => {
		set({ selectedModels: models })
	},

	startGeneration: async (question) => {
		const { selectedModels } = get()
		if (!question.trim() || selectedModels.length === 0) return

		set({
			isGenerating: true,
			currentQuestion: question,
			cards: [], // 卡片将由 manager 创建
		})

		// 动态导入避免循环依赖
		const { chatHubMgr } = await import('./chat-hub-mgr')
		await chatHubMgr.startGeneration(question, selectedModels)
	},

	stopGeneration: () => {
		set({ isGenerating: false, cards: [] })
		// 动态导入避免循环依赖
		import('./chat-hub-mgr').then(({ chatHubMgr }) => {
			chatHubMgr.stopGeneration()
		})
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


