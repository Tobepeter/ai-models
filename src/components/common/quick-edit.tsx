import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMemoizedFn } from 'ahooks'

/** 快速编辑组件 */
export const QuickEdit = (props: QuickEditProps) => {
	const {
		value,
		placeholder = '请输入内容...',
		onSubmit,
		onCancel,
		onSubmitChange,
		showEditIcon = true,
		iconPosition = 'right',
		containerClassName,
		textClassName,
		maxLength = 15,
		showCharCount = false,
		displayLimit = false,
		noAutoTrim = false,
		allowEmpty = true,
		className,
		...inputProps
	} = props

	const [isEditing, setIsEditing] = useState(false)
	const [editValue, setEditValue] = useState('')
	const [originalValue, setOriginalValue] = useState('')
	const inputRef = useRef<HTMLInputElement>(null)

	const handleEditStart = useMemoizedFn(() => {
		setIsEditing(true)
		setEditValue(value)
		setOriginalValue(value)
	})

	const handleCancel = useMemoizedFn(() => {
		setIsEditing(false)
		setEditValue('')
		onCancel?.(originalValue)
	})

	const handleSubmit = useMemoizedFn(async () => {
		const finalValue = noAutoTrim ? editValue : editValue.trim()
		const valueToSubmit = !allowEmpty && !finalValue ? originalValue : finalValue

		await onSubmit?.(valueToSubmit, originalValue)

		if (valueToSubmit !== originalValue) {
			await onSubmitChange?.(valueToSubmit, originalValue)
		}

		setIsEditing(false)
		setEditValue('')
	})

	const handleKeyDown = useMemoizedFn((e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			handleSubmit()
		} else if (e.key === 'Escape') {
			e.preventDefault()
			handleCancel()
		}
	})

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus()
			inputRef.current.select()
		}
	}, [isEditing])

	if (isEditing) {
		return (
			<div className={cn('relative', containerClassName)}>
				<Input
					ref={inputRef}
					value={editValue}
					onChange={(e) => setEditValue(e.target.value)}
					placeholder={placeholder}
					onBlur={handleSubmit}
					onKeyDown={handleKeyDown}
					maxLength={maxLength > 0 ? maxLength : undefined}
					className={cn('box-border py-1', displayLimit && maxLength > 0 ? 'px-2 pr-12' : 'px-2', className)}
					style={{ height: '28px' }}
					{...inputProps}
				/>
				{displayLimit && maxLength > 0 && (
					<span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
						{editValue.length}/{maxLength}
					</span>
				)}
			</div>
		)
	}

	return (
		<div className={cn('flex items-center', !showEditIcon && 'hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors', containerClassName)}>
			{showEditIcon && iconPosition === 'left' && (
				<Button variant="ghost" size="sm" className="h-6 w-6 p-0 mr-2 flex-shrink-0" onClick={handleEditStart}>
					<Edit className="h-3 w-3" />
				</Button>
			)}

			<div
				className={cn('flex-1 min-w-0 text-ellipsis overflow-hidden flex items-center', !showEditIcon && 'cursor-pointer', textClassName)}
				style={{ height: '28px' }}
				onClick={!showEditIcon ? handleEditStart : undefined}
			>
				{value || placeholder}
			</div>

			{showEditIcon && iconPosition === 'right' && (
				<Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-2 flex-shrink-0" onClick={handleEditStart}>
					<Edit className="h-3 w-3" />
				</Button>
			)}
		</div>
	)
}

export interface QuickEditProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onSubmit'> {
	value: string
	placeholder?: string
	onSubmit?: (value: string, originalValue: string) => void | Promise<void> // 提交时回调
	onCancel?: (originalValue: string) => void // 取消时回调
	onSubmitChange?: (value: string, originalValue: string) => void | Promise<void> // 只有内容变化时才会触发的提交回调
	showEditIcon?: boolean // 是否显示编辑图标，有图标时只能图标触发，无图标时文本触发并有hover提示
	iconPosition?: 'right' | 'left' // 编辑图标位置
	containerClassName?: string // 容器样式
	textClassName?: string // 文本显示样式
	maxLength?: number // 最大字符长度，默认15，<=0时不限制
	showCharCount?: boolean // 是否显示字符计数（已废弃，请使用 displayLimit）
	displayLimit?: boolean // 是否显示字符计数，默认false
	noAutoTrim?: boolean // 禁用自动trim，默认会自动去除首尾空格
	allowEmpty?: boolean // 是否允许空值，默认true，false时空值会回滚到原始值
}
