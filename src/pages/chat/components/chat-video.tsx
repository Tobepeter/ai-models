import { MediaData } from '@/pages/chat/chat-type'
import { VideoPreview } from '@/components/common/video-preview'
import { ChatDownload } from './chat-download'

/**
 * 聊天视频组件
 */
export const ChatVideo = (props: ChatVideoProps) => {
	const { url, filename, size, duration } = props

	return (
		<div className="mt-2" data-slot="chat-video">
			<VideoPreview url={url} notEditable={true} className="rounded-lg shadow-md" />
			<div className="mt-2">
				<ChatDownload url={url} filename={filename} size={size} />
			</div>
		</div>
	)
}

export type ChatVideoProps = MediaData
