import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { ChatMediaSelector } from './chat-media-selector'
import { MediaType } from '@/pages/chat/chat-store'

export const ChatInput = (props: ChatInputProps) => {
	const { 
		onSendMessage, 
		currentMediaType, 
		onMediaTypeChange,
		isLoading 
	} = props
	const [inputValue, setInputValue] = useState('')
	
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (inputValue.trim() && !isLoading) {
			onSendMessage(inputValue.trim(), currentMediaType)
			setInputValue('')
		}
	}
	
	const getPlaceholder = () => {
		const placeholders = {
			text: '输入您的问题...',
			image: '描述您想要的图片...',
			audio: '描述您想要的音频...',
			video: '描述您想要的视频...',
		}
		return placeholders[currentMediaType]
	}
	
	return (
		<form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t bg-background">
			<ChatMediaSelector 
				value={currentMediaType} 
				onChange={onMediaTypeChange}
			/>
			<div className="flex-1">
				<Input
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder={getPlaceholder()}
					disabled={isLoading}
					className="w-full"
				/>
			</div>
			<Button 
				type="submit" 
				size="sm" 
				disabled={!inputValue.trim() || isLoading}
				className="px-3"
			>
				<Send className="h-4 w-4" />
			</Button>
		</form>
	)
}

export type ChatInputProps = {
	onSendMessage: (message: string, mediaType: MediaType) => void
	currentMediaType: MediaType
	onMediaTypeChange: (type: MediaType) => void
	isLoading: boolean
} 