import { MediaData } from '@/pages/chat/chat-store'
import { ImagePreview } from '@/components/common/image-preview'
import { ChatDownload } from './chat-download'

/**
 * 聊天图片组件
 */
export const ChatImage = (props: ChatImageProps) => {
	const { url, filename, size } = props

	return (
		<div className="mt-2">
			<ImagePreview url={url} notEditable={true} className="w-full aspect-square" />
			<div className="mt-2">
				<ChatDownload url={url} filename={filename} size={size} />
			</div>
		</div>
	)
}

export type ChatImageProps = MediaData
