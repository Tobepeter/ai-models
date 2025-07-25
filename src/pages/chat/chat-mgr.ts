import { aiAgentMgr } from '@/utils/ai-agent/ai-agent-mgr'
import { isMock } from '@/utils/env'
import { eventBus, EventType } from '@/utils/event-bus'
import { MediaType } from '@/utils/ai-agent/types'
import { useChatStore } from './chat-store'
import { chatMock } from './chat-mock'

// 聊天管理器 - 处理AI生成相关的工作
class ChatMgr {
	// 文本生成
	async genText(input: string, id: string) {
		const s = useChatStore.getState()

		// TODO: loading理论进不来这里，不然loading计数有问题

		if (isMock) {
			await chatMock.mockDelay()
			const m = chatMock.genMockResp(input, 'text')
			s.updateMsg(id, {
				content: m.content,
				status: 'success',
				mediaData: m.mediaData,
			})
			return
		}

		s.setLoading(true)
		try {
			if (s.currStream) {
				await this.genTextStream(input, id)
			} else {
				await this.genTextDirect(input, id)
			}
		} catch (e) {
			s.updateMsg(id, {
				status: 'error',
				error: e instanceof Error ? e.message : '生成失败',
			})
		} finally {
			s.setLoading(false)
		}
	}

	// 流式生成文本
	private async genTextStream(input: string, id: string) {
		let content = ''
		await aiAgentMgr.genTextStream(input, (c: string) => {
			const s = useChatStore.getState()
			// 只是是代码保护，不过应该不会不loading
			if (s.isLoading) {
				content += c
				s.updateMsg(id, { content, status: 'generating' })
			} else {
				console.error('不太可能不loading')
			}
		})

		const s = useChatStore.getState()
		if (s.isLoading) {
			s.updateMsg(id, { status: 'success' })
			s.setLoading(false)
		} else {
			console.error('不太可能不loading')
		}
	}

	// 直接生成文本
	private async genTextDirect(input: string, id: string) {
		const res = await aiAgentMgr.generateText(input)
		const s = useChatStore.getState()
		if (s.isLoading) {
			s.updateMsg(id, {
				content: res,
				status: 'success',
			})
			s.setLoading(false)
		} else {
			console.error('不太可能不loading')
		}
	}

	// 图片生成处理
	async genImage(input: string, id: string) {
		const s = useChatStore.getState()

		if (isMock) {
			await chatMock.mockDelay()
			const m = chatMock.genMockResp(input, 'image')
			s.updateMsg(id, {
				content: m.content,
				status: 'success',
				mediaData: m.mediaData,
			})
			return
		}

		const imgs = await aiAgentMgr.generateImages(input)

		if (imgs && imgs.length > 0) {
			const url = imgs[0]
			s.updateMsg(id, {
				content: `已为您生成图片：${input}`,
				status: 'success',
				mediaData: {
					url,
					filename: 'generated-image.jpg',
				},
			})
		} else {
			throw new Error('未能生成图片')
		}
	}

	// 音频生成处理（暂时使用模拟数据）
	async genAudio(input: string, id: string) {
		const s = useChatStore.getState()
		await chatMock.mockDelay()
		const m = chatMock.genMockResp(input, 'audio')
		s.updateMsg(id, {
			content: m.content,
			status: 'success',
			mediaData: m.mediaData,
		})
	}

	// 视频生成处理
	async genVideo(input: string, id: string) {
		const s = useChatStore.getState()

		if (isMock) {
			await chatMock.mockDelay()
			const m = chatMock.genMockResp(input, 'video')
			s.updateMsg(id, {
				content: m.content,
				status: 'success',
				mediaData: m.mediaData,
			})
			return
		}

		const vids = await aiAgentMgr.generateVideos(input)
		if (vids && vids.length > 0) {
			s.updateMsg(id, {
				content: `已为您生成视频：${input}`,
				status: 'success',
				mediaData: {
					url: vids[0],
					filename: 'generated-video.mp4',
				},
			})
		} else {
			throw new Error('未能生成视频')
		}
	}

	// 生成AI响应
	async genAIResp(input: string, media: MediaType, id: string) {
		try {
			switch (media) {
				case 'text':
					await this.genText(input, id)
					break
				case 'image':
					await this.genImage(input, id)
					break
				case 'audio':
					await this.genAudio(input, id)
					break
				case 'video':
					await this.genVideo(input, id)
					break
				default:
					throw new Error(`不支持的媒体类型: ${media}`)
			}
		} catch (e) {
			console.error('AI generation failed:', e)
			const s = useChatStore.getState()
			s.updateMsg(id, {
				status: 'error',
				error: e instanceof Error ? e.message : '生成失败',
			})
		}
	}

	// 停止生成
	stop() {
		const s = useChatStore.getState()
		const list = s.msgList

		if (list.length >= 2) {
			let q = ''
			const aiMsg = list[list.length - 1]
			if (aiMsg.mediaType !== 'text') {
				console.error('只有文本对话可以停止')
				return
			}
			const userMsg = list[list.length - 2]
			if (userMsg.type === 'user') {
				q = userMsg.content
				useChatStore.setState({ msgList: list.slice(0, -2) })
				eventBus.emit(EventType.ChatStop, q)
			} else {
				console.error('倒数第二条消息不是用户消息')
			}
		} else {
			console.error('没有消息需要停止')
		}
	}

	// 重试消息
	async retryMsg(id: string) {
		const s = useChatStore.getState()
		const list = s.msgList
		const idx = list.findIndex((m) => m.id === id)

		if (idx === -1) {
			console.error('未找到要重试的消息')
			return
		}

		const m = list[idx]
		if (m.type !== 'assistant') {
			console.error('只能重试AI消息')
			return
		}

		let input = ''
		for (let i = idx - 1; i >= 0; i--) {
			const prev = list[i]
			if (prev.type === 'user') {
				input = prev.content
				break
			}
		}

		if (!input) {
			console.error('未找到对应的用户输入')
			return
		}

		s.updateMsg(id, {
			status: 'pending',
			content: '',
			error: undefined,
		})

		await this.genAIResp(input, m.mediaType, id)
	}
}

export const chatMgr = new ChatMgr()
