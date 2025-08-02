import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Image } from 'lucide-react'

/**  通用空状态组件 */
export const Empty = (props: EmptyProps) => {
	const { icon = <Image className="h-16 w-16 text-muted-foreground" />, title, desc, buttonText = '重试', onClickButton } = props
	return (
		<div className="h-full flex items-center justify-center p-8" data-slot="empty">
			<div className="text-center space-y-6 max-w-sm">
				{/* 图标 */}
				<div className="flex justify-center">{icon}</div>

				{/* 文案 */}
				{(title || desc) && (
					<div className="space-y-2">
						{title && <h3 className="text-lg font-medium text-foreground">{title}</h3>}
						{desc && (
							<div className="text-sm text-muted-foreground space-y-1">
								{desc.split('\n').map((line, idx) => (
									<p key={idx} className={idx > 0 ? 'text-xs' : ''}>
										{line}
									</p>
								))}
							</div>
						)}
					</div>
				)}

				{/* 按钮 */}
				{onClickButton && (
					<Button onClick={onClickButton} className="w-full">
						{buttonText}
					</Button>
				)}
			</div>
		</div>
	)
}

export interface EmptyProps {
	icon?: ReactNode
	title?: string
	desc?: string
	buttonText?: ReactNode
	onClickButton?: () => void
}
