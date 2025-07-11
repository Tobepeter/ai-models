import { aiAgentMgr } from '@/utils/ai-agent/ai-agent-mgr'
import { siliconflowModelConfig } from '@/utils/ai-agent/siliconflow-agent'
import { mockModelConfig } from '@/utils/ai-agent/mock-agent'
import { dummy } from '@/utils/dummy'
import { isMock } from '@/utils/env'
import { eventBus, EventType } from '@/utils/event-bus'
import { useChatStore } from './chat-store'
import { MediaType } from './chat-type'

/**
 * 聊天管理器 - 处理AI生成相关的工作
 */
class ChatManager {
	private mockDur = 300 // mock延迟时间

	/** 根据媒体类型自动选择模型 */
	private getModelForMediaType(mediaType: MediaType) {
		const cfg = siliconflowModelConfig
		switch (mediaType) {
			case 'text':
				return cfg.text[0]
			case 'image':
				return cfg.image[0]
			case 'video':
				return cfg.video?.[0] || cfg.text[0]
			default:
				return cfg.text[0]
		}
	}

	/** 模拟延迟 */
	private async mockDelay() {
		return new Promise((resolve) => setTimeout(resolve, this.mockDur + Math.random() * 1000))
	}

	/** 生成 mock 响应数据 */
	private genMockResp(userInput: string, mediaType: MediaType) {
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

	/** 文本生成处理 */
	async genText(userInput: string, msgId: string) {
		const store = useChatStore.getState()

		if (isMock) {
			await this.mockDelay()
			const mockResponse = this.genMockResp(userInput, 'text')
			store.updateMsg(msgId, {
				content: mockResponse.content,
				status: 'success',
				mediaData: mockResponse.mediaData,
			})
			return
		}

		store.setLoading(true)

		try {
			aiAgentMgr.setConfig({ model: this.getModelForMediaType('text') })

			let fullContent = ''

			// TODO: 如果chat卸载了，要完全防止写入 store 了，否则二次进入可能会有问题

			await aiAgentMgr.generateTextStream(userInput, (chunk: string) => {
				// 检查是否还在loading状态
				if (useChatStore.getState().isLoading) {
					fullContent += chunk
					store.updateMsg(msgId, { content: fullContent, status: 'generating' })
				}
			})

			// 完成后更新状态
			if (useChatStore.getState().isLoading) {
				store.updateMsg(msgId, { status: 'success' })
				store.setLoading(false)
			} else {
				console.error('不太可能不loading')
			}
		} catch (error) {
			if (useChatStore.getState().isLoading) {
				store.updateMsg(msgId, {
					status: 'error',
					error: error instanceof Error ? error.message : '生成失败',
				})
				store.setLoading(false)
			}
			throw error
		}
	}

	/** 图片生成处理 */
	async genImage(userInput: string, msgId: string) {
		const store = useChatStore.getState()

		if (isMock) {
			await this.mockDelay()
			const mockResponse = this.genMockResp(userInput, 'image')
			store.updateMsg(msgId, {
				content: mockResponse.content,
				status: 'success',
				mediaData: mockResponse.mediaData,
			})
			return
		}

		aiAgentMgr.setConfig({ model: this.getModelForMediaType('image') })

		const images = await aiAgentMgr.generateImages(userInput)

		if (images && images.length > 0) {
			const imageUrl = images[0]
			store.updateMsg(msgId, {
				content: `已为您生成图片：${userInput}`,
				status: 'success',
				mediaData: {
					url: imageUrl,
					filename: 'generated-image.jpg',
				},
			})
		} else {
			throw new Error('未能生成图片')
		}
	}

	/** 音频生成处理（暂时使用模拟数据） */
	async genAudio(userInput: string, msgId: string) {
		const store = useChatStore.getState()

		await this.mockDelay()
		const mockResponse = this.genMockResp(userInput, 'audio')

		store.updateMsg(msgId, {
			content: mockResponse.content,
			status: 'success',
			mediaData: mockResponse.mediaData,
		})
	}

	/** 视频生成处理 */
	async genVideo(userInput: string, msgId: string) {
		const store = useChatStore.getState()

		if (isMock) {
			await this.mockDelay()
			const mockResponse = this.genMockResp(userInput, 'video')
			store.updateMsg(msgId, {
				content: mockResponse.content,
				status: 'success',
				mediaData: mockResponse.mediaData,
			})
			return
		}

		aiAgentMgr.setConfig({ model: this.getModelForMediaType('video') })

		const videos = await aiAgentMgr.generateVideos(userInput)
		if (videos && videos.length > 0) {
			store.updateMsg(msgId, {
				content: `已为您生成视频：${userInput}`,
				status: 'success',
				mediaData: {
					url: videos[0],
					filename: 'generated-video.mp4',
				},
			})
		} else {
			throw new Error('未能生成视频')
		}
	}

	/** AI响应生成入口 */
	async genAIResp(userInput: string, mediaType: MediaType, msgId: string) {
		try {
			switch (mediaType) {
				case 'text':
					await this.genText(userInput, msgId)
					break
				case 'image':
					await this.genImage(userInput, msgId)
					break
				case 'audio':
					await this.genAudio(userInput, msgId)
					break
				case 'video':
					await this.genVideo(userInput, msgId)
					break
				default:
					throw new Error(`不支持的媒体类型: ${mediaType}`)
			}
		} catch (error) {
			console.error('AI generation failed:', error)
			const store = useChatStore.getState()
			store.updateMsg(msgId, {
				status: 'error',
				error: error instanceof Error ? error.message : '生成失败',
			})
		}
	}

	/** 停止生成 */
	stop() {
		const store = useChatStore.getState()
		const msgList = store.msgList

		if (msgList.length >= 2) {
			let userQuestion = ''
			const aiMsg = msgList[msgList.length - 1]

			// 必须是text类型
			if (aiMsg.mediaType !== 'text') {
				console.error('只有文本对话可以停止')
				return
			}

			const userMsg = msgList[msgList.length - 2]
			if (userMsg.type === 'user') {
				userQuestion = userMsg.content
				useChatStore.setState({ msgList: msgList.slice(0, -2) })
				eventBus.emit(EventType.ChatStop, userQuestion)
			} else {
				console.error('倒数第二条消息不是用户消息')
			}
		} else {
			console.error('没有消息需要停止')
		}
	}

	/** 重试消息 */
	async retryMsg(msgId: string) {
		const store = useChatStore.getState()
		const msgList = store.msgList
		const msgIndex = msgList.findIndex((msg) => msg.id === msgId)

		if (msgIndex === -1) {
			console.error('未找到要重试的消息')
			return
		}

		const msg = msgList[msgIndex]
		if (msg.type !== 'assistant') {
			console.error('只能重试AI消息')
			return
		}

		// 查找对应的用户消息（通常是前一条消息）
		let userInput = ''
		for (let i = msgIndex - 1; i >= 0; i--) {
			const prevMsg = msgList[i]
			if (prevMsg.type === 'user') {
				userInput = prevMsg.content
				break
			}
		}

		if (!userInput) {
			console.error('未找到对应的用户输入')
			return
		}

		// 重置消息状态
		store.updateMsg(msgId, {
			status: 'pending',
			content: '',
			error: undefined,
		})

		// 重新生成响应
		await this.genAIResp(userInput, msg.mediaType, msgId)
	}
}

export const chatMgr = new ChatManager()
