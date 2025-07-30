import { ScrollArea } from '@/components/ui/scroll-area'
import { aiAgentConfig } from '@/utils/ai-agent/ai-agent-config'
import { useMount } from 'ahooks'
import { useEffect, useRef } from 'react'
import { chatHelper } from './chat-helper'
import { useChatStore } from './chat-store'
import { ChatInput, ChatInvalidAlert, ChatMsg, ChatSettings, ChatToolbar } from './components'
import { useLockScroll } from '@/hooks/use-lock-scroll'

/**
 * 聊天页面主组件
 */
export const Chat = () => {
	const { msgList, currMediaType, isLoading } = useChatStore()
	const scrollAreaRef = useRef<HTMLDivElement>(null)

	useLockScroll()

	useMount(() => {
		aiAgentConfig.restore()
		chatHelper.restorePersist()
	})

	// 自动滚动到底部
	useEffect(() => {
		if (scrollAreaRef.current) {
			scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
		}
	}, [msgList, isLoading])

	return (
		<div className="flex flex-col h-full" data-slot="chat">
			{/* 消息列表 */}
			<div className="flex-1 overflow-hidden">
				<ScrollArea className="h-full">
					<div ref={scrollAreaRef} className="p-4 space-y-4">
						{msgList.length === 0 && (
							<div className="text-center text-muted-foreground py-8">
								<p className="text-lg mb-2">👋 您好！我是AI助手</p>
								<p className="text-sm">
									{currMediaType === 'text' && '我可以与您进行文本对话，回答您的问题。'}
									{currMediaType === 'image' && '我可以根据您的描述生成图片。'}
									{currMediaType === 'audio' && '我可以根据您的描述生成音频。'}
									{currMediaType === 'video' && '我可以根据您的描述生成视频。'}
								</p>
							</div>
						)}

						{msgList.map((msg) => (
							<ChatMsg key={msg.id} msg={msg} />
						))}
					</div>
				</ScrollArea>
			</div>

			{/* 工具栏 */}
			<ChatToolbar />

			{/* 输入区域 */}
			<div className="flex-shrink-0">
				<ChatInput />
			</div>

			{/* 弹窗 */}
			<ChatInvalidAlert />
			<ChatSettings />
		</div>
	)
}
