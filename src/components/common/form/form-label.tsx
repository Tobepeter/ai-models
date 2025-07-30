import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'
import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

/** 表单标签 - 统一样式 */
export const FormLabel = (props: PropsWithChildren<FormLabelProps>) => {
	const { htmlFor, children, className, required, tips } = props
	return (
		<Label htmlFor={htmlFor} className={cn('text-sm font-medium flex items-center gap-1', className)} data-slot="form-label">
			{children}
			{tips && (
				<Tooltip>
					<TooltipTrigger asChild>
						<HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
					</TooltipTrigger>
					<TooltipContent side="top">
						<p className="max-w-xs text-xs">{tips}</p>
					</TooltipContent>
				</Tooltip>
			)}
			{required && <span className="text-destructive">*</span>}
		</Label>
	)
}

export interface FormLabelProps {
	htmlFor?: string
	className?: string
	required?: boolean
	tips?: string
}
