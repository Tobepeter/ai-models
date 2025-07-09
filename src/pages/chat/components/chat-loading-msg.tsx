import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Loader2 } from 'lucide-react'

export const ChatLoadingMsg = () => {
	return (
		<div className="flex w-full mb-4 justify-start">
			<div className="flex max-w-[70%]">
				<Avatar className="w-8 h-8 mr-2">
					<AvatarFallback>AI</AvatarFallback>
				</Avatar>
				<div className="bg-muted px-4 py-2 rounded-lg">
					<div className="flex items-center gap-2">
						<Loader2 className="h-4 w-4 animate-spin" />
						<span className="text-sm text-muted-foreground">AI正在生成回复...</span>
					</div>
				</div>
			</div>
		</div>
	)
} 