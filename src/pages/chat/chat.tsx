import { useRef, useEffect } from 'react'
import { useChatStore, simulateAIResponse, MediaType } from './chat-store'
import { ChatMsg } from './components/chat-msg'
import { ChatInput } from './components/chat-input'
import { ChatLoadingMsg } from './components/chat-loading-msg'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMemoizedFn, useUnmount } from 'ahooks'
import { useTimer } from '@/hooks/use-timer'
import { eventBus, EventType } from '@/utils/event-bus'
import { ImagePreview } from '@/components/common/image-preview'
import { VideoPreview } from '@/components/common/video-preview'

/**
 * 聊天页面主组件
 */
export const Chat = () => {
	const { msgList, currentMediaType, isLoading, setCurMedia, addMessage, setLoading, reset, stopGen, removeLastMsg } = useChatStore()

	const scrollAreaRef = useRef<HTMLDivElement>(null)
	const { start, clear } = useTimer()

	// 组件卸载时重置 store
	useUnmount(() => {
		reset()
	})

	// 自动滚动到底部
	useEffect(() => {
		if (scrollAreaRef.current) {
			scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
		}
	}, [msgList, isLoading])

	const handleSendMessage = async (content: string, mediaType: MediaType) => {
		// 添加用户消息
		addMessage({
			type: 'user',
			content,
			mediaType,
		})

		// 设置加载状态
		setLoading(true)

		// 模拟AI响应延迟
		const delay = 1000 + Math.random() * 2000
		start(delay, () => {
			const aiResponse = simulateAIResponse(content, mediaType)
			addMessage(aiResponse)
			setLoading(false)
		})
	}

	const handleStopGeneration = useMemoizedFn(() => {
		if (!isLoading) {
			console.error('stopGeneration: not loading')
			return
		}

		setLoading(false)
		clear()
		stopGen()

		// 移除最后一条用户消息并通过事件总线传递内容
		const lastUserMessage = msgList.filter((msg) => msg.type === 'user').pop()
		if (lastUserMessage) {
			removeLastMsg()
			// 触发事件，将上一条消息内容传递给输入框
			eventBus.emit(EventType.ChatStop, lastUserMessage.content)
		}
	})

	return (
		<div className="flex flex-col h-screen bg-background">
			{/* 头部 */}
			<div className="flex-shrink-0 border-b bg-card px-4 py-3">
				<h1 className="text-lg font-semibold">
					AI 助手
					<span className="text-sm font-normal text-muted-foreground ml-2">
						{currentMediaType === 'text' && '文本对话'}
						{currentMediaType === 'image' && '图片生成'}
						{currentMediaType === 'audio' && '音频生成'}
						{currentMediaType === 'video' && '视频生成'}
					</span>
				</h1>
			</div>

			{/* 消息列表 */}
			<div className="flex-1 overflow-hidden">
				<ScrollArea className="h-full">
					<div ref={scrollAreaRef} className="p-4 space-y-4">
						{msgList.length === 0 && (
							<div className="text-center text-muted-foreground py-8">
								<p className="text-lg mb-2">👋 您好！我是AI助手</p>
								<p className="text-sm">
									{currentMediaType === 'text' && '我可以与您进行文本对话，回答您的问题。'}
									{currentMediaType === 'image' && '我可以根据您的描述生成图片。'}
									{currentMediaType === 'audio' && '我可以根据您的描述生成音频。'}
									{currentMediaType === 'video' && '我可以根据您的描述生成视频。'}
								</p>
							</div>
						)}

						{msgList.map((message) => (
							<ChatMsg key={message.id} message={message} />
						))}

						{isLoading && <ChatLoadingMsg />}
					</div>

					{/* TEST */}
					<ImagePreview url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" />
					<VideoPreview url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
				</ScrollArea>
			</div>

			{/* 输入区域 */}
			<div className="flex-shrink-0">
				<ChatInput onSend={handleSendMessage} currentMediaType={currentMediaType} onMediaTypeChange={setCurMedia} isLoading={isLoading} onStop={handleStopGeneration} />
			</div>
		</div>
	)
}
