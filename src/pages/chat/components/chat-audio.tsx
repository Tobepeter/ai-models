import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Download, Volume2 } from 'lucide-react'
import { MediaData } from '@/pages/chat/chat-store'

/**
 * 聊天音频组件
 */
export const ChatAudio = (props: ChatAudioProps) => {
	const { filename, size, duration } = props
	
	return (
		<Card className="mt-2 max-w-sm">
			<CardContent className="p-4">
				<div className="flex items-center space-x-3">
					<div className="flex-shrink-0">
						<div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
							<Volume2 className="h-5 w-5 text-green-600" />
						</div>
					</div>
					<div className="flex-1">
						<div className="flex items-center justify-between">
							<Button variant="ghost" size="sm">
								<Play className="h-4 w-4" />
							</Button>
							<span className="text-xs text-muted-foreground">
								{duration}
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-1 mt-2">
							<div className="bg-green-600 h-1 rounded-full" style={{ width: '30%' }}></div>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
					<span>{filename} • {size}</span>
					<Button variant="ghost" size="sm">
						<Download className="h-3 w-3" />
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}

export type ChatAudioProps = MediaData 