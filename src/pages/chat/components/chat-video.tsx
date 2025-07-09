import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Download, Film } from 'lucide-react'
import { MediaData } from '@/pages/chat/chat-store'

/**
 * 聊天视频组件
 */
export const ChatVideo = (props: ChatVideoProps) => {
	const { filename, size, duration } = props

	return (
		<Card className="mt-2 max-w-sm">
			<CardContent className="p-4">
				<div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-4 aspect-video relative">
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="text-center">
							<Film className="h-12 w-12 mx-auto mb-2 text-blue-600" />
							<p className="text-sm text-gray-600">视频内容预览</p>
						</div>
					</div>
					<div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
						<Button variant="ghost" size="sm" className="w-8 h-8 rounded-full bg-white/80">
							<Play className="h-4 w-4" />
						</Button>
						<div className="flex-1 mx-2">
							<div className="bg-white/80 rounded-full h-1">
								<div className="bg-blue-600 h-1 rounded-full" style={{ width: '25%' }}></div>
							</div>
						</div>
						<span className="text-xs text-gray-700 bg-white/80 px-2 py-1 rounded">{duration}</span>
					</div>
				</div>
				<div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
					<span>
						{filename} • {size}
					</span>
					<Button variant="ghost" size="sm">
						<Download className="h-3 w-3" />
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}

export type ChatVideoProps = MediaData
