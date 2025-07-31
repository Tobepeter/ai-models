import { PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

/** 表单项容器 */
export const FormItem = (props: PropsWithChildren<FormItemProps>) => {
	const { children, className } = props
	return (
		<div className={cn('flex flex-col gap-2', className)} data-slot="form-item">
			{children}
		</div>
	)
}

interface FormItemProps {
	className?: string
}
