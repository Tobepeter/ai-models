import { useState } from 'react'
import { useThrottle } from 'ahooks'
import { uniq } from 'lodash-es'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Settings, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 多选弹窗组件
 */
export const MultiSelectDialog = (props: MultiSelectDialogProps) => {
	const { value, defaultValue = [], onChange, hoverChange = false, groups, triggerText = '选择', dialogTitle = '选择项目', disabled = false, className } = props

	const [internalValue, setInternalValue] = useState<MultiSelectItem[]>(defaultValue)
	const [open, setOpen] = useState(false)
	const [hoveredGroup, setHoveredGroup] = useState<string | null>(() => {
		const firstGroupKey = Object.keys(groups)[0]
		return firstGroupKey || null
	})
	const [searchQuery, setSearchQuery] = useState('')
	const throttledSearchQuery = useThrottle(searchQuery, { wait: 300 })

	const selectedItems = value ?? internalValue

	/* 设置已选中的项目 */
	const setSelectedItems = (items: MultiSelectItem[] | ((prev: MultiSelectItem[]) => MultiSelectItem[])) => {
		if (typeof items === 'function') {
			const newItems = items(selectedItems)
			if (!value) setInternalValue(newItems)
			onChange?.(newItems)
		} else {
			if (!value) setInternalValue(items)
			onChange?.(items)
		}
	}

	/* 处理项目选择 */
	const handleItemToggle = (group: string, item: string) => {
		setSelectedItems((prev) => {
			const isSelected = prev.some((si) => si.group === group && si.item === item)
			return isSelected ? prev.filter((si) => !(si.group === group && si.item === item)) : [...prev, { group, item }]
		})
	}

	/* 移除项目 */
	const removeItem = (group: string, item: string) => {
		setSelectedItems((prev) => prev.filter((si) => !(si.group === group && si.item === item)))
	}

	/* 清空 */
	const clearAll = () => setSelectedItems([])

	/* 处理分组选择 */
	const handleGroupToggle = (groupKey: string, groupItems: string[], allSelected: boolean) => {
		if (allSelected) {
			setSelectedItems((prev) => prev.filter((si) => si.group !== groupKey))
		} else {
			setSelectedItems((prev) => {
				const existingItems = prev.filter((si) => si.group === groupKey).map((si) => si.item)
				const newItems = groupItems.filter((gi) => !existingItems.includes(gi))
				return [...prev, ...newItems.map((item) => ({ group: groupKey, item }))]
			})
		}
	}

	/* 获取已选中的项目数量 */
	const getSelectedCount = (groupKey: string, groupItems: string[]) => {
		return groupItems.filter((item) => selectedItems.some((si) => si.group === groupKey && si.item === item)).length
	}

	/* 过滤项目 */
	const filterItems = (items: string[]) => {
		if (!throttledSearchQuery) return items
		return items.filter((item) => item.toLowerCase().includes(throttledSearchQuery.toLowerCase()))
	}

	/* 过滤分组 */
	const filteredGroups = Object.entries(groups).reduce(
		(acc, [key, items]) => {
			const filteredItems = filterItems(uniq(items)) // 使用lodash-es去重，重复key会有问题
			if (filteredItems.length > 0) {
				acc[key] = filteredItems
			}
			return acc
		},
		{} as typeof groups
	)

	return (
		<div className={cn('space-y-4', className)}>
			{/* 已选择项目标签 - 固定高度容器 */}
			<div className="min-h-[60px] flex flex-wrap gap-2 content-start">
				{selectedItems.map((selectedItem) => (
					<Badge key={`external-${selectedItem.group}-${selectedItem.item}`} variant="secondary" className="flex items-center gap-1">
						{selectedItem.item}
						<button onClick={() => removeItem(selectedItem.group, selectedItem.item)} className="ml-1 hover:bg-muted-foreground/20 rounded-full w-3 h-3 flex items-center justify-center text-xs">
							×
						</button>
					</Badge>
				))}
			</div>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button variant="outline" className="w-full justify-between" disabled={disabled}>
						{triggerText} ({selectedItems.length})
						<Settings className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</DialogTrigger>
				<DialogContent className="w-[80%] min-w-[600px] max-h-[80vh] p-0 flex flex-col" style={{ maxWidth: 'unset', gap: 0 }}>
					<DialogHeader className="px-6 py-4 border-b flex-shrink-0">
						<DialogTitle>{dialogTitle}</DialogTitle>
					</DialogHeader>

					{/* 搜索框 */}
					<div className="px-6 py-3 border-b flex-shrink-0">
						<div className="flex items-center gap-3">
							<span className="text-sm font-medium text-muted-foreground whitespace-nowrap">搜索</span>
							<input
								type="text"
								placeholder="请输入关键字..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
							/>
						</div>
					</div>

					{/* 级联菜单 - 固定高度的内容区域 */}
					<div className="flex h-[700px]">
						{/* 左侧一级菜单 */}
						<div className="w-72 border-r">
							<ScrollArea className="h-full">
								<div className="p-2">
									{Object.entries(filteredGroups).map(([key, items]) => {
										const selectedCount = getSelectedCount(key, items)
										const isHovered = hoveredGroup === key

										return (
											<div
												key={key}
												className={cn('p-4 cursor-pointer border-b last:border-b-0 transition-colors', isHovered ? 'bg-muted' : 'hover:bg-muted/50')}
												onMouseEnter={hoverChange ? () => setHoveredGroup(key) : undefined}
												onClick={!hoverChange ? () => setHoveredGroup(key) : undefined}
											>
												<div className="flex items-center justify-between">
													<span className="font-medium">{key}</span>
													<div className="flex items-center gap-2">
														<Badge variant="outline" className="text-xs">
															{selectedCount}/{items.length}
														</Badge>
													</div>
												</div>
											</div>
										)
									})}
								</div>
							</ScrollArea>
						</div>

						{/* 右侧二级菜单 */}
						<div className="flex-1 flex flex-col min-h-0">
							{hoveredGroup && filteredGroups[hoveredGroup] && (
								<>
									{/* 分组操作栏 */}
									<div className="flex items-center justify-between p-4 border-b bg-muted/30 flex-shrink-0">
										<ScrollArea className="flex-1 mr-4">
											<span className="font-medium">{hoveredGroup}</span>
										</ScrollArea>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												const items = filteredGroups[hoveredGroup]
												const selectedCount = getSelectedCount(hoveredGroup, items)
												const allSelected = selectedCount === items.length
												handleGroupToggle(hoveredGroup, items, allSelected)
											}}
											className="h-7 px-3 text-sm flex-shrink-0"
										>
											{getSelectedCount(hoveredGroup, filteredGroups[hoveredGroup]) === filteredGroups[hoveredGroup].length ? '取消全选' : '全选'}
										</Button>
									</div>

									{/* 项目列表 - 使用ScrollArea包装确保正确滚动 */}
									<div className="flex-1 min-h-0">
										<ScrollArea className="h-full">
											<div className="p-4">
												{filteredGroups[hoveredGroup].map((item, index) => {
													const isSelected = selectedItems.some((si) => si.group === hoveredGroup && si.item === item)
													return (
														<div key={`${hoveredGroup}-${item}`}>
															<div className="flex items-center p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors" onClick={() => handleItemToggle(hoveredGroup, item)}>
																<Check className={cn('mr-3 h-4 w-4', isSelected ? 'opacity-100 text-primary' : 'opacity-0')} />
																<span className="font-medium">{item}</span>
															</div>
															{index < filteredGroups[hoveredGroup].length - 1 && <div className="border-b mx-3 my-2" />}
														</div>
													)
												})}
											</div>
										</ScrollArea>
									</div>
								</>
							)}
							{(!hoveredGroup || !filteredGroups[hoveredGroup]) && (
								<div className="flex items-center justify-center h-full text-muted-foreground">{throttledSearchQuery ? '搜索结果为空' : '选择左侧分组查看项目'}</div>
							)}
						</div>
					</div>

					{/* 底部：已选择标签 + 清空按钮 */}
					<div className="px-6 py-4 border-t bg-muted/20 flex-shrink-0">
						<div className="flex items-center justify-between gap-4">
							<div className="flex-1 min-w-0">
								<ScrollArea className="max-h-20">
									<div className="flex flex-wrap gap-2 pr-4">
										{selectedItems.map((selectedItem) => (
											<Badge key={`dialog-${selectedItem.group}-${selectedItem.item}`} variant="secondary" className="flex items-center gap-1">
												{selectedItem.item}
												<button
													onClick={() => removeItem(selectedItem.group, selectedItem.item)}
													className="ml-1 hover:bg-muted-foreground/20 rounded-full w-3 h-3 flex items-center justify-center text-xs"
												>
													×
												</button>
											</Badge>
										))}
										{selectedItems.length === 0 && <span className="text-sm text-muted-foreground">未选择任何项目</span>}
									</div>
								</ScrollArea>
							</div>
							<Button variant="outline" size="sm" onClick={clearAll} disabled={selectedItems.length === 0} className="flex items-center gap-2">
								<X className="h-3 w-3" />
								清空
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export interface MultiSelectItem {
	group: string
	item: string
}

export type MultiSelectDialogProps = {
	value?: MultiSelectItem[] // 已选中的项目
	defaultValue?: MultiSelectItem[] // 默认选中的项目
	onChange?: (items: MultiSelectItem[]) => void // 选中项目变化时的回调
	hoverChange?: boolean // 是否通过鼠标悬停切换分组
	groups: Record<string, string[]> // 分组配置
	triggerText?: string // 触发按钮文本
	dialogTitle?: string // 弹窗标题
	disabled?: boolean // 是否禁用
	className?: string // 自定义样式
}
