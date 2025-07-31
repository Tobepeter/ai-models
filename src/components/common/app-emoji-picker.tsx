import EmojiPicker, { Theme } from 'emoji-picker-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useTheme } from 'next-themes'
import { useState, ReactNode } from 'react'

export interface AppEmojiPickerProps {
	onEmojiSelect: (emoji: string) => void
	onClear?: () => void
	trigger?: ReactNode
}

/**
 * Apple风格emoji选择器
 * 提供emoji选择和清除功能的弹出组件
 */
export const AppEmojiPicker = (props: AppEmojiPickerProps) => {
	const { onEmojiSelect, onClear, trigger } = props
	const { resolvedTheme } = useTheme()
	const [isOpen, setIsOpen] = useState(false)

	const handleEmojiSelect = (emojiData: any) => {
		console.log('Emoji selected:', emojiData) // 调试输出格式
		onEmojiSelect(emojiData.emoji)
		setIsOpen(false)
	}

	const handleClear = () => {
		onClear?.()
		setIsOpen(false)
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen} data-slot="app-emoji-mart">
			<PopoverTrigger asChild>
				{trigger || (
					<Button variant="outline" size="sm">
						选择表情
					</Button>
				)}
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0 border-0 shadow-lg" side="bottom" align="start" sideOffset={4}>
				<div className="overflow-hidden rounded-lg">
					<EmojiPicker
						onEmojiClick={handleEmojiSelect}
						theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT}
						previewConfig={{
							showPreview: false,
						}}
						skinTonesDisabled={true}
						searchDisabled={false}
						width={350}
						height={400}
						// 使用系统原生表情
						emojiStyle={'native' as any}
					/>

					{/* 清除按钮 */}
					{onClear && (
						<div className="border-t bg-background p-2">
							<Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground" onClick={handleClear}>
								清除表情
							</Button>
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	)
}
