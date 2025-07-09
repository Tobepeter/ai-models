import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export const ChatImage = (props: ChatImageProps) => {
	const { mediaData } = props
	
	return (
		<div className="mt-2">
			<img 
				src={mediaData.url} 
				alt="Generated image"
				className="max-w-sm rounded-lg shadow-md"
			/>
			<div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
				<span>{mediaData.filename} • {mediaData.size}</span>
				<Button variant="ghost" size="sm">
					<Download className="h-3 w-3" />
				</Button>
			</div>
		</div>
	)
}

export type ChatImageProps = {
	mediaData: {
		url?: string
		filename?: string
		size?: string
	}
} 