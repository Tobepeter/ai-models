import { ModelConfig } from '../chat-hub-type'
import { Button } from '@/components/ui/button'

/**
 * 模型选择器组件
 */
export const ChatHubModelSelector = (props: ChatHubModelSelectorProps) => {
	const { models, selectedModels, onChange, disabled = false } = props

	const handleToggle = (model: ModelConfig) => {
		if (disabled) return

		const isSelected = selectedModels.some((m) => m.id === model.id)
		if (isSelected) {
			// 取消选择
			onChange(selectedModels.filter((m) => m.id !== model.id))
		} else {
			// 添加选择
			onChange([...selectedModels, model])
		}
	}

	return (
		<div className="flex flex-wrap gap-2">
			{models.map((model) => {
				const isSelected = selectedModels.some((m) => m.id === model.id)
				return (
					<Button
						key={model.id}
						onClick={() => handleToggle(model)}
						disabled={disabled}
						variant={isSelected ? 'default' : 'outline'}
						size="sm"
						className="rounded-full"
					>
						{model.name}
					</Button>
				)
			})}
		</div>
	)
}

export type ChatHubModelSelectorProps = {
	models: ModelConfig[]
	selectedModels: ModelConfig[]
	onChange: (models: ModelConfig[]) => void
	disabled?: boolean
}
