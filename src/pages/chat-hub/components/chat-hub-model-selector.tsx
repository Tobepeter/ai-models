import { ChatHubModel } from '../chat-hub-type'
import { MultiSelectDialog, MultiSelectItem } from '@/components/ui/multi-select-dialog'
import { useMemo } from 'react'

/**
 * 模型选择器组件
 */
export const ChatHubModelSelector = (props: ChatHubModelSelectorProps) => {
	const { models, selectedModels, onChange, disabled = false } = props

	/* 将模型按平台分组 */
	const modelGroups = useMemo(() => {
		const groups: Record<string, string[]> = {}
		
		models.forEach((model) => {
			if (!groups[model.platform]) {
				groups[model.platform] = []
			}
			groups[model.platform].push(model.name)
		})
		
		return groups
	}, [models])

	/* 获取选中的模型项目数组 */
	const selectedModelItems = useMemo(() => {
		return selectedModels.map((model) => ({
			group: model.platform,
			item: model.name
		}))
	}, [selectedModels])

	/* 处理选择变化 */
	const handleSelectionChange = (selectedItems: MultiSelectItem[]) => {
		const newSelectedModels = models.filter((model) => 
			selectedItems.some(item => item.group === model.platform && item.item === model.name)
		)
		onChange(newSelectedModels)
	}

	return (
		<div>
			<MultiSelectDialog
				value={selectedModelItems}
				onChange={handleSelectionChange}
				groups={modelGroups}
				triggerText="选择AI模型"
				dialogTitle="选择AI模型"
				disabled={disabled}
				hoverChange={true}
			/>
		</div>
	)
}

export type ChatHubModelSelectorProps = {
	models: ChatHubModel[]
	selectedModels: ChatHubModel[]
	onChange: (models: ChatHubModel[]) => void
	disabled?: boolean
}
