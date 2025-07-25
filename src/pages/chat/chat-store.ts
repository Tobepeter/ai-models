import { AIPlatform, MediaType } from '@/utils/ai-agent/types'
import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { chatMgr } from './chat-mgr'
import { Msg } from './chat-type'

// 初始状态
const defaultState = {
	msgList: [] as Msg[],
	currMediaType: 'text' as MediaType,
	currPlatform: AIPlatform.Unknown as AIPlatform,
	currModel: '',
	currStream: true,
	isLoading: false,
	showSettings: false,
	showInvalidAlert: false,
}

const chatState = defaultState

type ChatState = typeof chatState

const stateCreator = () =>
	combine(chatState, (set, get) => ({
		setData: (data: Partial<ChatState>) => set(data),

		// 添加消息 自动生成id 和 timestamp
		addMsg: (msg: Omit<Msg, 'id' | 'timestamp'>) => {
			const newMsg: Msg = {
				...msg,
				id: uuidv4(),
				timestamp: Date.now(),
			}
			// NOTE: 数组类型只能这么操作，不知道是否要引入immer
			set({ msgList: [...get().msgList, newMsg] })
		},

		// 根据id更新消息
		updateMsg: (id: string, updates: Partial<Msg>) => {
			set({
				msgList: get().msgList.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
			})
		},

		// 设置加载状态
		setLoading: (loading: boolean) => set({ isLoading: loading }),

		// 清空消息
		clearMsg: () => set({ msgList: [] }),

		// 重置
		reset: () => set(defaultState),

		// 停止生成
		stopGen: () => {
			const store = get() as ChatStore
			store.setLoading(false)
			chatMgr.stop()
		},

		// 移除最后一条消息
		removeLastMsg: () => {
			const msgList = get().msgList
			if (msgList.length > 0) {
				const lastMessage = msgList[msgList.length - 1]
				set({ msgList: msgList.slice(0, -1) })
				return lastMessage
			}
			return null
		},

		// 生成AI响应
		genAIResp: (userInput: string, mediaType: MediaType) => {
			const aiMsg: Msg = {
				id: uuidv4(),
				type: 'assistant',
				content: '',
				mediaType,
				timestamp: Date.now(),
				status: 'pending',
			}
			set({ msgList: [...get().msgList, aiMsg] }) // 添加消息到列表
			chatMgr.genAIResp(userInput, mediaType, aiMsg.id)
		},
	}))

export const useChatStore = create(stateCreator())

export type ChatStore = ReturnType<ReturnType<typeof stateCreator>>
