import { HelpCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'

/**
 * 表单字段组件，支持标签和帮助提示
 */
export const FormTips = (props: PropsWithChildren<FormTipsProps>) => {
	const { label, help, htmlFor, className, children } = props

	return (
		<div className={cn('flex flex-col gap-2', className)}>
			<div className="flex items-center gap-2">
				<Label htmlFor={htmlFor}>{label}</Label>
				{help && (
					<Tooltip>
						<TooltipTrigger asChild>
							<HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
						</TooltipTrigger>
						<TooltipContent side="top">
							<p className="max-w-xs">{help}</p>
						</TooltipContent>
					</Tooltip>
				)}
			</div>
			{children}
		</div>
	)
}

export interface FormTipsProps {
	label: string
	help?: string
	htmlFor?: string
	className?: string
}
