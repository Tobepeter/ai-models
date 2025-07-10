import { useState, useRef, ChangeEvent, KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { useClickAway } from 'ahooks'
import { X } from 'lucide-react'

/**
 * 建议输入组件
 */
export const SuggestInput = (props: SuggestInputProps) => {
	const { className, suggestions = [], onChange, placeholder = '请输入...', value, defaultValue, maxSuggest = 5 } = props

	const [internalValue, setInternalValue] = useState(defaultValue ?? '')

	const [suggestIdx, setSuggestIdx] = useState(-1)
	const [isFocused, setIsFocused] = useState(false)
	const suggestionRefs = useRef<(HTMLDivElement | null)[]>([])
	const inputRef = useRef<HTMLInputElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	const currValue = value ?? internalValue // 受控/非受控模式

	// NOTE: 我原本想通过失焦的，但是发现有问题
	// 点击建议部分会失去焦点，导致 suggestions 消失，并未触发 suggestion click
	useClickAway(() => {
		if (isFocused) {
			clearSuggestions()
		}
	}, containerRef)

	const getFilteredSuggestions = (inputValue: string) => {
		const sortedSuggestions = [...suggestions].sort((a, b) => a.localeCompare(b))
		let filtered: string[]
		if (inputValue.trim() === '') {
			filtered = sortedSuggestions
		} else {
			filtered = sortedSuggestions.filter((suggestion) => suggestion.toLowerCase().includes(inputValue.toLowerCase()))
		}
		return filtered.slice(0, maxSuggest) // 限制数量
	}
	const filteredSuggestions = getFilteredSuggestions(currValue)
	const hasSuggestions = filteredSuggestions.length > 0

	const clearSuggestions = () => {
		setIsFocused(false)
		setSuggestIdx(-1)
		inputRef.current?.blur()
	}

	const selectSuggestion = (suggestion: string) => {
		if (value === undefined) {
			setInternalValue(suggestion)
		}
		clearSuggestions()
		onChange?.(suggestion)
	}

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		if (value === undefined) {
			setInternalValue(newValue)
		}
		setSuggestIdx(0)
		onChange?.(newValue)
	}

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		const { key } = e

		if (key === 'Tab' && hasSuggestions) {
			e.preventDefault() // 防止tab到下一个输入框
			const selectedSuggestion = filteredSuggestions[suggestIdx >= 0 ? suggestIdx : 0]
			if (selectedSuggestion) {
				selectSuggestion(selectedSuggestion)
			}
			return
		}

		if (key === 'Enter') {
			e.preventDefault() // 防止默认的表单提交
			clearSuggestions()
			return
		}

		if (key === 'ArrowDown') {
			e.preventDefault() // 防止输入的光标跳动
			setSuggestIdx((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0))
			return
		}

		// 向上选择建议
		if (key === 'ArrowUp') {
			e.preventDefault() // 防止输入的光标跳动
			setSuggestIdx((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1))
			return
		}

		// 关闭下拉选择
		if (key === 'Escape') {
			clearSuggestions()
			return
		}

		// 注意，这里还有默认的字符输入，不要 preventDefault
	}

	const handleSuggestionClick = (suggestion: string) => {
		selectSuggestion(suggestion)
	}

	const handleFocus = () => {
		setIsFocused(true)
		setSuggestIdx(0) // 聚焦时默认选择第一个建议
	}

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation() // 阻止事件冒泡，防止触发 useClickAway
		if (value === undefined) {
			setInternalValue('')
		}
		onChange?.('')
		// 确保保持焦点状态
		setIsFocused(true)
		setSuggestIdx(0)
	}

	return (
		<div className="relative" ref={containerRef}>
			<div className="relative">
				<Input
					ref={inputRef}
					className={cn(className, isFocused && currValue && 'pr-8')}
					placeholder={placeholder}
					value={currValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					onFocus={handleFocus}
				/>
				{isFocused && currValue && (
					<button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={handleClear}>
						<X size={16} />
					</button>
				)}
			</div>

			{isFocused && hasSuggestions && (
				<div className="absolute w-full mt-2 bg-background border border-input rounded-lg shadow-lg">
					{filteredSuggestions.map((suggestion, idx) => (
						<div
							key={idx}
							ref={(el) => {
								suggestionRefs.current[idx] = el
							}}
							className={cn('px-3 py-2 cursor-pointer text-sm hover:bg-accent hover:text-accent-foreground', idx === suggestIdx && 'bg-accent text-secondary-foreground')}
							onClick={() => handleSuggestionClick(suggestion)}
						>
							{suggestion}
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export type SuggestInputProps = {
	className?: string
	suggestions?: string[] // 建议列表
	onChange?: (value: string) => void
	placeholder?: string
	value?: string
	defaultValue?: string
	maxSuggest?: number // 最多展示的建议数量
}
