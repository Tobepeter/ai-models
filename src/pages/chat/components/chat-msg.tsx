import { Message } from '@/pages/chat/chat-store'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChatMedia } from './chat-media'

/**
 * 聊天消息组件
 */
export const ChatMsg = (props: ChatMsgProps) => {
	const { message } = props
	const isUser = message.type === 'user'

	return (
		<div className={cn('flex w-full mb-4', isUser ? 'justify-end' : 'justify-start')}>
			<div className={cn('flex max-w-[70%]', isUser ? 'flex-row-reverse' : 'flex-row')}>
				{!isUser && (
					<Avatar className="w-8 h-8 mr-2">
						<AvatarFallback>AI</AvatarFallback>
					</Avatar>
				)}
				<div className={cn('px-4 py-2 rounded-lg', isUser ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
					<p className="text-sm whitespace-pre-wrap">{message.content}</p>
					<ChatMedia message={message} />
				</div>
			</div>
		</div>
	)
}

export type ChatMsgProps = {
	message: Message
}
