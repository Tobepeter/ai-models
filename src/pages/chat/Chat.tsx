import { useRef, useEffect } from 'react'
import { useChatStore, simulateAIResponse, MediaType } from './chat-store'
import { ChatMessageItem } from './components/chat-message-item'
import { ChatInput } from './components/chat-input'
import { ChatLoadingMessage } from './components/chat-loading-message'
import { ScrollArea } from '@/components/ui/scroll-area'

export const Chat = () => {
	const { 
		messages, 
		currentMediaType, 
		isLoading, 
		setCurrentMediaType, 
		addMessage, 
		setLoading 
	} = useChatStore()
	
	const scrollAreaRef = useRef<HTMLDivElement>(null)
	
	// 自动滚动到底部
	useEffect(() => {
		if (scrollAreaRef.current) {
			scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
		}
	}, [messages, isLoading])
	
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
		setTimeout(() => {
			const aiResponse = simulateAIResponse(content, mediaType)
			addMessage(aiResponse)
			setLoading(false)
		}, 1000 + Math.random() * 2000) // 1-3秒随机延迟
	}
	
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
						{messages.length === 0 && (
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
						
						{messages.map((message) => (
							<ChatMessageItem key={message.id} message={message} />
						))}
						
						{isLoading && <ChatLoadingMessage />}
					</div>
				</ScrollArea>
			</div>
			
			{/* 输入区域 */}
			<div className="flex-shrink-0">
				<ChatInput
					onSendMessage={handleSendMessage}
					currentMediaType={currentMediaType}
					onMediaTypeChange={setCurrentMediaType}
					isLoading={isLoading}
				/>
			</div>
		</div>
	)
} 