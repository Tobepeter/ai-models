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

export interface MediaData {
	url?: string
	filename?: string
	size?: string
	duration?: string
}

export interface ChatPersist {
	platform: AIPlatform
	model: string
	stream?: boolean
}
