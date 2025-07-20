// 视频状态联合类型
export type VideoStatus = 'Succeed' | 'InQueue' | 'InProgress' | 'Failed'

// 自定义视频相关类型
export interface VideoSubmitResp {
	requestId: string
	status: 'submitted'
}

export interface VideoStatusResp {
	status: VideoStatus
	results?: {
		videos: Array<{ url: string }>
		timings?: { inference: number }
		seed?: number
	}
	reason?: string
}

// Mock数据
export const MOCK_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
export const MOCK_IMAGE = 'https://avatars.githubusercontent.com/u/124599?v=4'
