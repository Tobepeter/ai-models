import { Message } from '@/pages/chat/chat-store'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Download, Volume2, Film, Image } from 'lucide-react'

export const ChatMessageItem = (props: ChatMessageItemProps) => {
	const { message } = props
	const isUser = message.type === 'user'
	
	const renderMediaContent = () => {
		if (!message.mediaData) return null
		
		switch (message.mediaType) {
			case 'image':
				return (
					<div className="mt-2">
						<img 
							src={message.mediaData.url} 
							alt="Generated image"
							className="max-w-sm rounded-lg shadow-md"
						/>
						<div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
							<span>{message.mediaData.filename} • {message.mediaData.size}</span>
							<Button variant="ghost" size="sm">
								<Download className="h-3 w-3" />
							</Button>
						</div>
					</div>
				)
			case 'audio':
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
											{message.mediaData.duration}
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-1 mt-2">
										<div className="bg-green-600 h-1 rounded-full" style={{ width: '30%' }}></div>
									</div>
								</div>
							</div>
							<div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
								<span>{message.mediaData.filename} • {message.mediaData.size}</span>
								<Button variant="ghost" size="sm">
									<Download className="h-3 w-3" />
								</Button>
							</div>
						</CardContent>
					</Card>
				)
			case 'video':
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
									<span className="text-xs text-gray-700 bg-white/80 px-2 py-1 rounded">
										{message.mediaData.duration}
									</span>
								</div>
							</div>
							<div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
								<span>{message.mediaData.filename} • {message.mediaData.size}</span>
								<Button variant="ghost" size="sm">
									<Download className="h-3 w-3" />
								</Button>
							</div>
						</CardContent>
					</Card>
				)
			default:
				return null
		}
	}
	
	return (
		<div className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}>
			<div className={cn("flex max-w-[70%]", isUser ? "flex-row-reverse" : "flex-row")}>
				{!isUser && (
					<Avatar className="w-8 h-8 mr-2">
						<AvatarFallback>AI</AvatarFallback>
					</Avatar>
				)}
				<div className={cn(
					"px-4 py-2 rounded-lg",
					isUser 
						? "bg-primary text-primary-foreground" 
						: "bg-muted"
				)}>
					<p className="text-sm whitespace-pre-wrap">{message.content}</p>
					{renderMediaContent()}
				</div>
			</div>
		</div>
	)
}

export type ChatMessageItemProps = {
	message: Message
} 