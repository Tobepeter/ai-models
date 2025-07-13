import { AIPlatform, MediaType } from '@/utils/ai-agent/types'

export type MsgStatus = 'pending' | 'generating' | 'success' | 'error'

export interface Msg {
	id: string
	type: 'user' | 'assistant'
	content: string
	mediaType: MediaType
	timestamp: number
	status?: MsgStatus
	error?: string
	mediaData?: MediaData
}

export type MediaData = {
	url?: string
	filename?: string
	size?: string
	duration?: string
}

export type ChatPersist = {
	platform: AIPlatform
	model: string
}