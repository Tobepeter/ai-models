import { Msg } from '@/pages/chat/chat-type'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react'
import { ChatMedia } from './chat-media'
import { chatMgr } from '@/pages/chat/chat-mgr'

/**
 * 聊天消息组件
 */
export const ChatMsg = (props: ChatMsgProps) => {
	const { msg } = props
	const isUser = msg.type === 'user'

	const handleRetry = async () => {
		await chatMgr.retryMsg(msg.id)
	}

	return (
		<div className={cn('flex w-full mb-4', isUser ? 'justify-end' : 'justify-start')}>
			<div className={cn('flex max-w-[75%]', isUser ? 'flex-row-reverse' : 'flex-row')}>
				{!isUser && (
					<Avatar className="w-8 h-8 mr-2">
						<AvatarFallback>AI</AvatarFallback>
					</Avatar>
				)}
				<div className={cn('px-4 py-2 rounded-lg', isUser ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
					{/* 消息内容 */}
					{msg.content && (
						<p className="text-sm whitespace-pre-wrap">{msg.content}</p>
					)}

					{/* 用户消息的媒体内容 */}
					{isUser && (
						<ChatMedia msg={msg} />
					)}

					{/* 状态显示 */}
					{!isUser && msg.status === 'pending' && (
						<div className="flex items-center gap-2 text-ms text-muted-foreground">
							<Loader2 className="w-4 h-4 animate-spin" />
							<span>
								{msg.mediaType === 'text' && '正在思考...'}
								{msg.mediaType === 'image' && '正在生成图片...'}
								{msg.mediaType === 'audio' && '正在生成音频...'}
								{msg.mediaType === 'video' && '正在生成视频...'}
							</span>
						</div>
					)}

					{/* 错误显示 */}
					{!isUser && msg.status === 'error' && (
						<div className="mt-2 p-2 bg-destructive/10 rounded border border-destructive/20">
							<div className="flex items-center gap-2 text-ms text-destructive">
								<AlertCircle className="w-3 h-3" />
								<span>{msg.error || '生成失败'}</span>
							</div>
							<Button
								size="sm"
								variant="outline"
								onClick={handleRetry}
								className="mt-2 h-7 px-2"
							>
								<RotateCcw className="w-3 h-3 mr-1" />
								重试
							</Button>
						</div>
					)}

					{/* 媒体内容 */}
					{msg.status === 'success' && (
						<ChatMedia msg={msg} />
					)}
				</div>
			</div>
		</div>
	)
}

export type ChatMsgProps = {
	msg: Msg
}
