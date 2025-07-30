import { MediaData } from '@/pages/chat/chat-type'
import { ImagePreview } from '@/components/common/image-preview'
import { ChatDownload } from './chat-download'

/**
 * 聊天图片组件
 */
export const ChatImage = (props: ChatImageProps) => {
	const { url, filename, size } = props

	return (
		<div className="mt-2" data-slot="chat-image">
			<ImagePreview url={url} noEditable={true} className="w-full aspect-square" />
			<div className="mt-2">
				<ChatDownload url={url} filename={filename} size={size} />
			</div>
		</div>
	)
}

export type ChatImageProps = MediaData
