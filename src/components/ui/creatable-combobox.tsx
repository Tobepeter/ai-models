import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

/* 可添加新选项的下拉选择组件 */
export const CreatableCombobox = (props: CreatableComboboxProps) => {
	const {
		options,
		value,
		onValueChange,
		onAddOption,
		placeholder = 'Select option...',
		searchPlaceholder = 'Search...',
		emptyText = 'No option found.',
		addButtonText = (input) => `添加 "${input}"`,
		allowAdd = true,
		className,
		disabled = false,
	} = props

	const [open, setOpen] = useState(false)
	const [inputValue, setInputValue] = useState('')

	const selectedOption = options.find((option) => option.value === value)
	const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()))
	const exactMatch = options.some((option) => option.label.toLowerCase() === inputValue.toLowerCase())
	const showAddButton = allowAdd && inputValue.trim() && !exactMatch

	const handleSelect = (selectedValue: string) => {
		const newValue = selectedValue === value ? '' : selectedValue
		onValueChange?.(newValue)
		setOpen(false)
	}

	const handleAddOption = () => {
		if (!inputValue.trim() || exactMatch) return

		const newValue = inputValue.trim()
		onAddOption?.(newValue)
		onValueChange?.(newValue)
		setOpen(false)
		setInputValue('')
	}

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter' && showAddButton) {
			const commandItems = document.querySelectorAll('[cmdk-item]')
			const selectedItem = Array.from(commandItems).find((item) => item.getAttribute('aria-selected') === 'true')

			if (!selectedItem) {
				event.preventDefault()
				handleAddOption()
			}
		}
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={open} className={cn('w-full justify-between', className)} disabled={disabled}>
					{selectedOption ? selectedOption.label : placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0" align="start">
				<Command onKeyDown={handleKeyDown}>
					<CommandInput placeholder={searchPlaceholder} value={inputValue} onValueChange={setInputValue} />
					<CommandList>
						{filteredOptions.length === 0 && !showAddButton && <CommandEmpty>{emptyText}</CommandEmpty>}
						{filteredOptions.length > 0 && (
							<CommandGroup>
								{filteredOptions.map((option) => (
									<CommandItem key={option.value} value={option.value} onSelect={handleSelect}>
										<Check className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
										{option.label}
									</CommandItem>
								))}
							</CommandGroup>
						)}
						{showAddButton && (
							<>
								{filteredOptions.length > 0 && <CommandSeparator />}
								<CommandGroup>
									<CommandItem onSelect={handleAddOption} className="text-primary">
										<Plus className="mr-2 h-4 w-4" />
										{addButtonText(inputValue)}
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}

export interface ComboboxOption {
	value: string
	label: string
}

export interface CreatableComboboxProps {
	options: ComboboxOption[]
	value?: string
	onValueChange?: (value: string) => void
	onAddOption?: (newOption: string) => void
	placeholder?: string
	searchPlaceholder?: string
	emptyText?: string
	addButtonText?: (inputValue: string) => string
	allowAdd?: boolean
	className?: string
	disabled?: boolean
}
