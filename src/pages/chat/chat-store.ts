import { AIPlatform, MediaType } from '@/utils/ai-agent/types'
import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'
import { chatMgr } from './chat-mgr'
import { Msg } from './chat-type'

export interface ChatStore {
	msgList: Msg[]
	currMediaType: MediaType
	currPlatform: AIPlatform
	currModel: string
	isLoading: boolean

	showSettings: boolean
	showInvalidAlert: boolean

	setData: (data: Partial<ChatStore>) => void

	addMsg: (msg: Omit<Msg, 'id' | 'timestamp'>) => void
	updateMsg: (id: string, updates: Partial<Msg>) => void
	setLoading: (loading: boolean) => void
	clearMsg: () => void
	reset: () => void
	stopGen: () => void
	removeLastMsg: () => Msg | null
	genAIResp: (userInput: string, mediaType: MediaType) => Promise<void>
}

export const useChatStore = create<ChatStore>((set, get) => ({
	msgList: [],
	currMediaType: 'text',
	currPlatform: AIPlatform.Unknown,
	currModel: '',
	isLoading: false,
	showSettings: false,
	showInvalidAlert: false,

	setData: (data) => set({ ...get(), ...data }),

	addMsg: (msg) => {
		const newMsg: Msg = {
			...msg,
			id: uuidv4(),
			timestamp: Date.now(),
		}
		set({ msgList: [...get().msgList, newMsg] })
	},

	updateMsg: (id, updates) => {
		set({
			msgList: get().msgList.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
		})
	},

	setLoading: (loading) => set({ isLoading: loading }),

	clearMsg: () => set({ msgList: [] }),

	reset: () => {
		set({ msgList: [], isLoading: false, showSettings: false, showInvalidAlert: false })
	},

	stopGen: () => {
		get().setLoading(false)
		chatMgr.stop()
	},

	removeLastMsg: () => {
		const msgList = get().msgList
		if (msgList.length > 0) {
			const lastMessage = msgList[msgList.length - 1]
			set({ msgList: msgList.slice(0, -1) })
			return lastMessage
		}
		return null
	},

	genAIResp: async (userInput: string, mediaType: MediaType) => {
		const aiMsg: Msg = {
			id: uuidv4(),
			type: 'assistant',
			content: '',
			mediaType,
			timestamp: Date.now(),
			status: 'pending',
		}
		set({ msgList: [...get().msgList, aiMsg] })
		await chatMgr.genAIResp(userInput, mediaType, aiMsg.id)
	},
}))
