export type MediaType = 'text' | 'image' | 'audio' | 'video'

export type MsgStatus = 'pending' | 'success' | 'error'

export interface Msg {
	id: string
	type: 'user' | 'assistant'
	content: string
	mediaType: MediaType
	timestamp: number
	// 新增状态字段
	status?: MsgStatus
	error?: string
	// 模拟的媒体数据
	mediaData?: MediaData
}

export type MediaData = {
	url?: string
	filename?: string
	size?: string
	duration?: string
}
