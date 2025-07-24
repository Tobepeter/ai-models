import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/** 密码输入框 - 带显示/隐藏功能 */
export const FormPwd = (props: FormPwdProps) => {
	const { id, placeholder, value, onChange, disabled, error, autoComplete, className, showToggle = true } = props
	const [showPwd, setShowPwd] = useState(false)

	return (
		<>
			<div className="relative">
				<Input
					id={id}
					type={showPwd ? 'text' : 'password'}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					disabled={disabled}
					className={cn(error ? 'border-destructive' : '', showToggle ? 'pr-10' : '', className)}
					autoComplete={autoComplete}
				/>
				{showToggle && (
					<button
						type="button"
						onClick={() => setShowPwd(!showPwd)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
						disabled={disabled}
					>
						{showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
					</button>
				)}
			</div>
			{error && <p className="text-sm text-destructive">{error}</p>}
		</>
	)
}

export interface FormPwdProps {
	id: string
	placeholder?: string
	value: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	disabled?: boolean
	error?: string
	autoComplete?: string
	className?: string
	showToggle?: boolean // 是否显示密码切换按钮
}
