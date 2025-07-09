import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { MediaData } from '@/pages/chat/chat-store'

/**
 * 聊天图片组件
 */
export const ChatImage = (props: ChatImageProps) => {
	const { url, filename, size } = props

	return (
		<div className="mt-2">
			<img src={url} alt="Generated image" className="max-w-sm rounded-lg shadow-md" />
			<div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
				<span>
					{filename} • {size}
				</span>
				<Button variant="ghost" size="sm">
					<Download className="h-3 w-3" />
				</Button>
			</div>
		</div>
	)
}

export type ChatImageProps = MediaData
