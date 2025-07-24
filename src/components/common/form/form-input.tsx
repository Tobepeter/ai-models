import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export const FormInput = (props: FormInputProps) => {
	const { id, type, placeholder, value, onChange, disabled, error, autoComplete, className } = props
	return (
		<>
			<Input
				id={id}
				type={type}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				disabled={disabled}
				className={cn(error ? 'border-destructive' : '', className)}
				autoComplete={autoComplete}
			/>
			{error && <p className="text-sm text-destructive">{error}</p>}
		</>
	)
}

export interface FormInputProps {
	id: string
	type?: string
	placeholder?: string
	value: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	disabled?: boolean
	error?: string
	autoComplete?: string
	className?: string
}
