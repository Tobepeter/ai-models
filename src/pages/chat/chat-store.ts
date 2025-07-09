import { create } from 'zustand'

export type MediaType = 'text' | 'image' | 'audio' | 'video'

export interface Message {
	id: string
	type: 'user' | 'assistant'
	content: string
	mediaType: MediaType
	timestamp: number
	// 模拟的媒体数据
	mediaData?: {
		url?: string
		filename?: string
		size?: string
		duration?: string
	}
}

interface ChatStore {
	messages: Message[]
	currentMediaType: MediaType
	isLoading: boolean
	setCurrentMediaType: (type: MediaType) => void
	addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
	setLoading: (loading: boolean) => void
	clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
	messages: [],
	currentMediaType: 'text',
	isLoading: false,
	
	setCurrentMediaType: (type) => set({ currentMediaType: type }),
	
	addMessage: (message) => {
		const newMessage: Message = {
			...message,
			id: Date.now().toString(),
			timestamp: Date.now(),
		}
		set({ messages: [...get().messages, newMessage] })
	},
	
	setLoading: (loading) => set({ isLoading: loading }),
	
	clearMessages: () => set({ messages: [] }),
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
				url: `https://picsum.photos/400/300?random=${Date.now()}`,
				filename: 'generated-image.jpg',
				size: '2.5MB',
			},
		},
		audio: {
			content: `已为您生成音频：${userInput}`,
			mediaData: {
				url: '/audio-sample.mp3',
				filename: 'generated-audio.mp3',
				size: '3.2MB',
				duration: '0:45',
			},
		},
		video: {
			content: `已为您生成视频：${userInput}`,
			mediaData: {
				url: '/video-sample.mp4',
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
