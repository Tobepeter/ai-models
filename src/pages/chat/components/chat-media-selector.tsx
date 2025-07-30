import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MediaType } from '@/utils/ai-agent/types'
import { ChevronDown, Film, Image, MessageCircle, Volume2 } from 'lucide-react'
import { ElementType } from 'react'
import { useChatStore } from '../chat-store'
import { chatHelper } from '../chat-helper'

/**
 * 媒体类型选择器组件
 */
export const ChatMediaSelector = () => {
	const { currMediaType, setData } = useChatStore()
	const currConfig = chatHelper.mediaConfig[currMediaType]
	const CurrIcon = currConfig.icon

	const handleSelect = (type: MediaType) => {
		setData({ currMediaType: type })
	}

	return (
		<DropdownMenu data-slot="chat-media-selector">
			<DropdownMenuTrigger asChild>
				<Button variant="default" size="sm" className="gap-2">
					<CurrIcon className="h-4 w-4" />
					<span>{currConfig.label}</span>
					<ChevronDown className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				{Object.entries(chatHelper.mediaConfig).map(([type, config]) => {
					const Icon = config.icon
					return (
						<DropdownMenuItem key={type} onClick={() => handleSelect(type as MediaType)} className="gap-2">
							<Icon className="h-4 w-4" />
							<span>{config.label}</span>
						</DropdownMenuItem>
					)
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
