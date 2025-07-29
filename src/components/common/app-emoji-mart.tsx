import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useState, ReactNode } from 'react'

export interface AppEmojiMartProps {
	onEmojiSelect: (emoji: string) => void
	onClear?: () => void
	trigger?: ReactNode
}

// Apple风格emoji选择器
export const AppEmojiMart = (props: AppEmojiMartProps) => {
	const { onEmojiSelect, onClear, trigger } = props
	const [isOpen, setIsOpen] = useState(false)

	const handleEmojiSelect = (emoji: any) => {
		console.log('Emoji selected:', emoji) // 调试输出格式
		onEmojiSelect(emoji.native || emoji.unified || emoji)
		setIsOpen(false)
	}

	const handleClear = () => {
		onClear?.()
		setIsOpen(false)
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				{trigger || (
					<Button variant="outline" size="sm">
						选择表情
					</Button>
				)}
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0 border-0 shadow-lg" side="bottom" align="start" sideOffset={4}>
				<div className="overflow-hidden rounded-lg">
					<Picker
						data={data}
						set="native" // 告诉 emoji-mart 使用系统原生的 Unicode 表情符号，而不是图片形式的表情
						locale="zh" // 中文
						theme="light"
						previewPosition="none"
						onEmojiSelect={handleEmojiSelect}
						// NOTE：支持为某些表情（主要是人物表情）选择不同的肤色，比如：
						// - 👋 (默认黄色)
						// - 👋🏻 (浅肤色)
						// - 👋🏼 (中浅肤色)
						// - 👋🏽 (中等肤色)
						// - 👋🏾 (中深肤色)
						// - 👋🏿 (深肤色)
						skinTonePosition="none"
						perLine={8}
						maxFrequentRows={2}
						// 默认分类顺序
						// categories={['frequent', 'people', 'nature', 'foods', 'activity', 'places', 'objects', 'symbols', 'flags']}
						// 强制使用系统emoji字体
						style={{
							fontSize: '18px',
							// NOTE: native的系统字体
							// - 'Apple Color Emoji' - 苹果系统的彩色表情字体
							// - 'Segoe UI Emoji' - Windows 系统的表情字体
							// - 'Noto Color Emoji' - Google 的开源表情字体（Linux等）
							// - 'system-ui' - 系统默认UI字体
							// - 'sans-serif' - 无衬线字体作为最后回退
							fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, system-ui, sans-serif',
						}}
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
