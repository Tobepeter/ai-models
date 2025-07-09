import { ChatImage } from './chat-image'
import { ChatAudio } from './chat-audio'
import { ChatVideo } from './chat-video'
import { Message } from '@/pages/chat/chat-store'

export const ChatMedia = (props: ChatMediaProps) => {
	const { message } = props
	
	if (!message.mediaData) return null
	
	switch (message.mediaType) {
		case 'image':
			return <ChatImage mediaData={message.mediaData} />
		case 'audio':
			return <ChatAudio mediaData={message.mediaData} />
		case 'video':
			return <ChatVideo mediaData={message.mediaData} />
		default:
			return null
	}
}

export type ChatMediaProps = {
	message: Message
} 