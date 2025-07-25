import { dummy } from '@/utils/dummy'
import { MediaType } from '@/utils/ai-agent/types'

// 聊天Mock管理器 - 处理模拟响应相关的工作
class ChatMock {
	private mockDur = 300 // mock延迟时间

	// 模拟延迟
	async mockDelay() {
		return new Promise((resolve) => setTimeout(resolve, this.mockDur + Math.random() * 1000))
	}

	// mock 响应数据
	genMockResp(userInput: string, mediaType: MediaType) {
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
					url: dummy.audio,
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

		return responses[mediaType]
	}
}

export const chatMock = new ChatMock() 