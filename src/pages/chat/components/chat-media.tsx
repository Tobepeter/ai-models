import { ChatImage } from './chat-image'
import { ChatAudio } from './chat-audio'
import { ChatVideo } from './chat-video'
import { Message } from '@/pages/chat/chat-store'

/**
 * 聊天媒体组件
 */
export const ChatMedia = (props: ChatMediaProps) => {
	const { message } = props
	const { mediaData } = message

	if (!mediaData) return null

	switch (message.mediaType) {
		case 'image':
			return <ChatImage {...mediaData} />
		case 'audio':
			return <ChatAudio {...mediaData} />
		case 'video':
			return <ChatVideo {...mediaData} />
		default:
			return null
	}
}

export type ChatMediaProps = {
	message: Message
}
