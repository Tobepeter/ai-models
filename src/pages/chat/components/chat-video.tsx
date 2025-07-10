import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { MediaData } from '@/pages/chat/chat-store'
import { VideoPreview } from '@/components/common/video-preview'
import { useMemoizedFn } from 'ahooks'
import { download } from '@/utils/download'

/**
 * 聊天视频组件
 */
export const ChatVideo = (props: ChatVideoProps) => {
	const { url, filename, size, duration } = props

	const handleDownload = useMemoizedFn(() => {
		if (!url || !filename) return
		download(url, filename)
	})

	return (
		<div className="mt-2">
			<VideoPreview 
				url={url} 
				notEditable={true}
				width={400}
				height={225}
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

export type ChatVideoProps = MediaData
