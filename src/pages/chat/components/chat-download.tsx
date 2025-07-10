import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useMemoizedFn } from 'ahooks'
import { download } from '@/utils/download'

/**
 * 聊天下载组件
 */
export const ChatDownload = (props: ChatDownloadProps) => {
	const { url, filename, size } = props

	const handleDownload = useMemoizedFn(() => {
		if (!url || !filename) return
		download(url, filename)
	})

	return (
		<div className="flex items-center justify-between text-xs text-muted-foreground">
			<span>
				{filename} • {size}
			</span>
			<Button variant="ghost" size="sm" onClick={handleDownload}>
				<Download className="h-3 w-3" />
			</Button>
		</div>
	)
}

export type ChatDownloadProps = {
	url: string
	filename: string
	size: string
} 