import { MediaType } from '@/pages/chat/chat-store'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, MessageCircle, Image, Volume2, Film } from 'lucide-react'

const mediaTypeConfig = {
	text: { icon: MessageCircle, label: '文本' },
	image: { icon: Image, label: '图片' },
	audio: { icon: Volume2, label: '音频' },
	video: { icon: Film, label: '视频' },
}

export const ChatMediaSelector = (props: ChatMediaTypeSelectorProps) => {
	const { value, onChange } = props
	const currentConfig = mediaTypeConfig[value]
	const CurrentIcon = currentConfig.icon
	
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="default" size="sm" className="gap-2">
					<CurrentIcon className="h-4 w-4" />
					<span>{currentConfig.label}</span>
					<ChevronDown className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				{Object.entries(mediaTypeConfig).map(([type, config]) => {
					const Icon = config.icon
					return (
						<DropdownMenuItem
							key={type}
							onClick={() => onChange(type as MediaType)}
							className="gap-2"
						>
							<Icon className="h-4 w-4" />
							<span>{config.label}</span>
						</DropdownMenuItem>
					)
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export type ChatMediaTypeSelectorProps = {
	value: MediaType
	onChange: (type: MediaType) => void
} 