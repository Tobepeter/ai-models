import { Shimmer } from '@/components/common/shimmer'
import { Markdown } from '@/components/common/markdown'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { chatMgr } from '@/pages/chat/chat-mgr'
import { Msg } from '@/pages/chat/chat-type'
import { AlertCircle, Loader2, RotateCcw } from 'lucide-react'
import { ChatMedia } from './chat-media'
import { ChatText } from './chat-text'
import { StreamText } from '@/components/common/stream-text'

/**
 * 聊天消息组件
 */
export const ChatMsg = (props: ChatMsgProps) => {
	const { msg } = props
	const isUser = msg.type === 'user'

	const handleRetry = () => {
		chatMgr.retryMsg(msg.id)
	}

	// NOTE: 多种内容组件，保留下来可以切换
	// const chatComp = msg.status === 'generating' ? (
	// 	<ChatText content={msg.content} isStream={true} />
	// ) : (
	// 	<Markdown content={msg.content} />
	// )

	// const chatComp = <ChatText content={msg.content} isStream={true} />
	const chatComp = <Markdown content={msg.content} />

	return (
		<div className={cn('flex w-full mb-4', isUser ? 'justify-end' : 'justify-start')} data-slot="chat-msg">
			<div className={cn('flex max-w-[85%]', isUser ? 'flex-row-reverse' : 'flex-row')}>
				{!isUser && (
					<Avatar className="w-8 h-8 mr-2">
						<AvatarFallback>AI</AvatarFallback>
					</Avatar>
				)}
				<div className={cn('px-4 py-2 rounded-lg', isUser ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
					{/* 消息内容 */}
					{chatComp}

					{/* 用户消息的媒体内容 */}
					{isUser && <ChatMedia msg={msg} />}

					{/* 加载中 */}
					{!isUser && msg.status === 'pending' && (
						<div className="flex items-center gap-2 text-ms">
							<Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
							<Shimmer className="text-muted-foreground text-sm">
								{msg.mediaType === 'text' && '正在思考...'}
								{msg.mediaType === 'image' && '正在生成图片...'}
								{msg.mediaType === 'audio' && '正在生成音频...'}
								{msg.mediaType === 'video' && '正在生成视频...'}
							</Shimmer>
						</div>
					)}

					{/* 错误显示 */}
					{!isUser && msg.status === 'error' && (
						<div className="mt-2 p-2 bg-destructive/10 rounded border border-destructive/20 text-sm">
							<div className="flex items-center gap-2 text-ms text-destructive">
								<AlertCircle className="w-3 h-3" />
								<span>{msg.error || '生成失败'}</span>
							</div>
							<Button size="sm" variant="outline" onClick={handleRetry} className="mt-2 h-7 px-2">
								<RotateCcw className="w-3 h-3 mr-1" />
								重试
							</Button>
						</div>
					)}

					{/* 媒体内容 */}
					{(msg.status === 'success' || msg.status === 'generating') && <ChatMedia msg={msg} />}
				</div>
			</div>
		</div>
	)
}

export interface ChatMsgProps {
	msg: Msg
}
