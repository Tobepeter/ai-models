import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MediaType } from '@/pages/chat/chat-store'
import { useMount } from 'ahooks'
import { Send, Square } from 'lucide-react'
import { useRef, useState } from 'react'
import { ChatMediaSelector } from './chat-media-selector'
import { useEvent, EventType } from '@/utils/event-bus'

/**
 * 聊天输入框组件
 */
export const ChatInput = (props: ChatInputProps) => {
	const { onSend, currMediaType, onMediaTypeChange, isLoading, onStop } = props
	const [inputVal, setInputVal] = useState('')
	const inputRef = useRef<HTMLInputElement>(null)
	const autoFocus = false

	// 自动聚焦
	useMount(() => {
		if (autoFocus) {
			inputRef.current?.focus()
		}
	})

	// 监听 ChatStop 事件，设置输入框值
	useEvent(EventType.ChatStop, (lastMessage) => {
		if (lastMessage) {
			setInputVal(lastMessage)
			inputRef.current?.focus()
		}
	})

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleClick()
		} else if (e.key === 'Escape') {
			if (isLoading) {
				onStop()
			} else {
				inputRef.current?.blur()
			}
		}
	}

	const handleClick = () => {
		if (isLoading) {
			onStop()
		} else if (inputVal.trim()) {
			onSend(inputVal.trim(), currMediaType)
			setInputVal('')
			inputRef.current?.blur() // 发送后失焦
		}
	}

	const getPlaceholder = () => {
		const placeholders = {
			text: '输入您的问题...',
			image: '描述您想要的图片...',
			audio: '描述您想要的音频...',
			video: '描述您想要的视频...',
		}
		return placeholders[currMediaType]
	}

	const buttonDisabled = !isLoading && !inputVal.trim()

	return (
		<div className="flex gap-2 p-4 border-t bg-background">
			<ChatMediaSelector value={currMediaType} onChange={onMediaTypeChange} />
			<div className="flex-1">
				<Input ref={inputRef} value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={handleKeyDown} placeholder={getPlaceholder()} disabled={isLoading} className="w-full" />
			</div>
			<Button type="button" size="sm" variant={isLoading ? 'outline' : 'default'} onClick={handleClick} disabled={buttonDisabled} className="px-3">
				{isLoading ? <Square className="h-4 w-4" /> : <Send className="h-4 w-4" />}
			</Button>
		</div>
	)
}

export type ChatInputProps = {
	onSend: (message: string, mediaType: MediaType) => void
	currMediaType: MediaType
	onMediaTypeChange: (type: MediaType) => void
	isLoading: boolean
	onStop: () => void
}
