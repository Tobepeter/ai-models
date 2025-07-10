import { create } from 'zustand'
import { dummy } from '@/utils/dummy'

export type MediaType = 'text' | 'image' | 'audio' | 'video'

export interface Message {
	id: string
	type: 'user' | 'assistant'
	content: string
	mediaType: MediaType
	timestamp: number
	// 模拟的媒体数据
	mediaData?: MediaData
}

export type MediaData = {
	url?: string
	filename?: string
	size?: string
	duration?: string
}

interface ChatStore {
	msgList: Message[]
	currentMediaType: MediaType
	isLoading: boolean
	setCurMedia: (type: MediaType) => void
	addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
	setLoading: (loading: boolean) => void
	clearMsg: () => void
	reset: () => void
	stopGen: () => void
	removeLastMsg: () => Message | null // 返回被移除的消息
}

export const useChatStore = create<ChatStore>((set, get) => ({
	msgList: [],
	currentMediaType: 'text',
	isLoading: false,

	setCurMedia: (type) => set({ currentMediaType: type }),

	addMessage: (message) => {
		const newMessage: Message = {
			...message,
			id: Date.now().toString(),
			timestamp: Date.now(),
		}
		set({ msgList: [...get().msgList, newMessage] })
	},

	setLoading: (loading) => set({ isLoading: loading }),

	clearMsg: () => set({ msgList: [] }),

	reset: () =>
		set({
			msgList: [],
			currentMediaType: 'text',
			isLoading: false,
		}),

	stopGen: () => {
		set({ isLoading: false })
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
}))

// 模拟AI响应的函数
export const simulateAIResponse = (userInput: string, mediaType: MediaType): Message => {
	const responses = {
		text: {
			content: `这是对"${userInput}"的AI回复。我是一个AI助手，很高兴为您服务！`,
			mediaData: undefined,
		},
		image: {
			content: `已为您生成图片：${userInput}`,
			mediaData: {
				url: dummy.image,
				filename: 'generated-image.jpg',
				size: '2.5MB',
			},
		},
		audio: {
			content: `已为您生成音频：${userInput}`,
			mediaData: {
				url: dummy.sounds.mp3,
				filename: 'generated-audio.mp3',
				size: '3.2MB',
				duration: '0:45',
			},
		},
		video: {
			content: `已为您生成视频：${userInput}`,
			mediaData: {
				url: dummy.video,
				filename: 'generated-video.mp4',
				size: '15.8MB',
				duration: '1:30',
			},
		},
	}

	return {
		id: Date.now().toString(),
		type: 'assistant',
		content: responses[mediaType].content,
		mediaType,
		timestamp: Date.now(),
		mediaData: responses[mediaType].mediaData,
	}
}
