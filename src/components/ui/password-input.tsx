import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface PasswordInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	showToggle?: boolean
}

/* 密码输入框 - 带显示/隐藏功能，兼容shadcn Form */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
	({ className, showToggle = true, ...props }, ref) => {
		const [showPassword, setShowPassword] = useState(false)

		return (
			<div className="relative">
				<Input
					{...props}
					type={showPassword ? 'text' : 'password'}
					className={cn(showToggle ? 'pr-10' : '', className)}
					ref={ref}
				/>
				{showToggle && (
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
						tabIndex={-1}
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</button>
				)}
			</div>
		)
	}
)

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }