import { ChatImage } from './chat-image'
import { ChatAudio } from './chat-audio'
import { ChatVideo } from './chat-video'
import { Msg } from '@/pages/chat/chat-type'

/**
 * 聊天媒体组件
 */
export const ChatMedia = (props: ChatMediaProps) => {
	const { msg } = props
	const { mediaData } = msg

	if (!mediaData) return null

	switch (msg.mediaType) {
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
	msg: Msg
}
