import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { MediaData } from '@/pages/chat/chat-store'
import { ImagePreview } from '@/components/common/image-preview'
import { useMemoizedFn } from 'ahooks'
import { download } from '@/utils/download'

/**
 * 聊天图片组件
 */
export const ChatImage = (props: ChatImageProps) => {
	const { url, filename, size } = props

	const handleDownload = useMemoizedFn(() => {
		if (!url || !filename) return
		download(url, filename)
	})

	return (
		<div className="mt-2">
			<ImagePreview 
				url={url} 
				notEditable={true}
				size={300}
				className="rounded-lg shadow-md"
			/>
			<div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
				<span>
					{filename} • {size}
				</span>
				<Button variant="ghost" size="sm" onClick={handleDownload}>
					<Download className="h-3 w-3" />
				</Button>
			</div>
		</div>
	)
}

export type ChatImageProps = MediaData
