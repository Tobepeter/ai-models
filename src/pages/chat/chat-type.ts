export type MediaType = 'text' | 'image' | 'audio' | 'video'

export type MsgStatus = 'pending' | 'success' | 'error'

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
