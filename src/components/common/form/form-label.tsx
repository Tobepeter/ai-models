import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'

/** 表单标签 - 统一样式 */
export const FormLabel = (props: PropsWithChildren<FormLabelProps>) => {
	const { htmlFor, children, className, required } = props
	return (
		<Label htmlFor={htmlFor} className={cn('text-sm font-medium', className)}>
			{children}
			{required && <span className="text-destructive ml-1">*</span>}
		</Label>
	)
}

export interface FormLabelProps {
	htmlFor: string
	className?: string
	required?: boolean
}
