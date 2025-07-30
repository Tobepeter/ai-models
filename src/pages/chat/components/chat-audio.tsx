import { Card, CardContent } from '@/components/ui/card'
import { MediaData } from '@/pages/chat/chat-type'
import { ChatDownload } from './chat-download'

/**
 * 聊天音频组件
 */
export const ChatAudio = (props: ChatAudioProps) => {
	const { url, filename, size } = props

	return (
		<Card className="mt-2 max-w-sm" data-slot="chat-audio">
			<CardContent className="p-4">
				<audio controls className="w-full mb-3">
					<source src={url} />
					你的浏览器不支持音频播放
				</audio>
				<ChatDownload url={url} filename={filename} size={size} />
			</CardContent>
		</Card>
	)
}

export type ChatAudioProps = MediaData
