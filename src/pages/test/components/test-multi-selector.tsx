import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { MultiSelectDialog } from '@/components/ui/multi-select-dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useThrottle } from 'ahooks'
import { Check, ChevronsUpDown, Database, Layers, Settings } from 'lucide-react'
import { useState } from 'react'

// 模拟模型配置数据（保留其他方案使用）
interface ModelConfig {
	id: string
	platform: string
	model: string
	name: string
	enabled: boolean
	description?: string
	tags?: string[]
	pricing?: 'free' | 'paid'
}

interface GroupConfig {
	title: string
	icon: React.ComponentType<{ className?: string }>
	models: ModelConfig[]
}

const mockModels: ModelConfig[] = [
	// Silicon Flow 模型
	{
		id: 'silicon-1',
		platform: 'silicon',
		model: 'deepseek-ai/DeepSeek-R1',
		name: 'DeepSeek R1',
		enabled: true,
		description: '推理能力强的大模型',
		tags: ['推理', '多语言'],
		pricing: 'free',
	},
	{
		id: 'silicon-2',
		platform: 'silicon',
		model: 'THUDM/GLM-4.1V-9B-Thinking',
		name: 'GLM-4.1V-9B',
		enabled: false,
		description: '多模态思维模型',
		tags: ['多模态', '思维链'],
		pricing: 'free',
	},
	{
		id: 'silicon-3',
		platform: 'silicon',
		model: 'Qwen/Qwen3-32B',
		name: 'Qwen3-32B',
		enabled: true,
		description: '阿里云大模型',
		tags: ['快速', '中文优化'],
		pricing: 'free',
	},
	{
		id: 'silicon-4',
		platform: 'silicon',
		model: 'tencent/Hunyuan-A13B-Instruct',
		name: 'Hunyuan-A13B',
		enabled: false,
		description: '腾讯混元模型',
		tags: ['指令跟随', '中文'],
		pricing: 'free',
	},
	// OpenRouter 免费模型
	{
		id: 'openrouter-1',
		platform: 'openrouter',
		model: 'deepseek/deepseek-chat-v3-0324:free',
		name: 'DeepSeek Chat V3 (Free)',
		enabled: true,
		description: 'DeepSeek 免费版本',
		tags: ['免费', '对话'],
		pricing: 'free',
	},
	{
		id: 'openrouter-2',
		platform: 'openrouter',
		model: 'deepseek/deepseek-r1:free',
		name: 'DeepSeek R1 (Free)',
		enabled: false,
		description: 'DeepSeek R1 免费版本',
		tags: ['免费', '推理'],
		pricing: 'free',
	},
	{
		id: 'openrouter-3',
		platform: 'openrouter',
		model: 'moonshotai/kimi-dev-72b:free',
		name: 'Kimi Dev 72B (Free)',
		enabled: false,
		description: 'Moonshot AI 免费模型',
		tags: ['免费', '大容量'],
		pricing: 'free',
	},
	{
		id: 'openrouter-4',
		platform: 'openrouter',
		model: 'tencent/hunyuan-a13b-instruct:free',
		name: 'Hunyuan A13B (Free)',
		enabled: false,
		description: '腾讯混元免费版本',
		tags: ['免费', '中文'],
		pricing: 'free',
	},
	// OpenRouter 付费模型
	{
		id: 'openrouter-5',
		platform: 'openrouter-premium',
		model: 'anthropic/claude-3.5-sonnet',
		name: 'Claude 3.5 Sonnet',
		enabled: false,
		description: 'Anthropic 最新模型',
		tags: ['高质量', '长上下文'],
		pricing: 'paid',
	},
	{
		id: 'openrouter-6',
		platform: 'openrouter-premium',
		model: 'openai/gpt-4o',
		name: 'GPT-4o',
		enabled: false,
		description: 'OpenAI 最新多模态模型',
		tags: ['多模态', '高质量'],
		pricing: 'paid',
	},
	{
		id: 'openrouter-7',
		platform: 'openrouter-premium',
		model: 'google/gemini-pro',
		name: 'Gemini Pro',
		enabled: false,
		description: 'Google 高级模型',
		tags: ['快速', '多模态'],
		pricing: 'paid',
	},
	// Mock 模型
	{
		id: 'mock-1',
		platform: 'mock',
		model: 'mock-gpt-4',
		name: 'Mock GPT-4',
		enabled: true,
		description: '模拟 GPT-4 模型',
		tags: ['测试', '模拟'],
		pricing: 'free',
	},
	{
		id: 'mock-2',
		platform: 'mock',
		model: 'mock-claude-3',
		name: 'Mock Claude-3',
		enabled: false,
		description: '模拟 Claude-3 模型',
		tags: ['测试', '模拟'],
		pricing: 'free',
	},
	{
		id: 'mock-3',
		platform: 'mock',
		model: 'mock-deepseek',
		name: 'Mock DeepSeek',
		enabled: false,
		description: '模拟 DeepSeek 模型',
		tags: ['测试', '模拟'],
		pricing: 'free',
	},
]

// 按平台分组
const groupedModels: Record<string, GroupConfig> = mockModels.reduce(
	(acc, model) => {
		const platformGroups = {
			silicon: { title: 'Silicon Flow', icon: Database },
			openrouter: { title: 'OpenRouter (免费)', icon: Layers },
			'openrouter-premium': { title: 'OpenRouter (付费)', icon: Settings },
			mock: { title: 'Mock Models', icon: Database },
		}

		const group = platformGroups[model.platform as keyof typeof platformGroups]
		if (!group) return acc

		if (!acc[model.platform]) {
			acc[model.platform] = {
				...group,
				models: [],
			}
		}
		acc[model.platform].models.push(model)
		return acc
	},
	{} as Record<string, GroupConfig>
)

// 分组可折叠选择器组件
const ModelGroupSelector = () => {
	const [selectedModels, setSelectedModels] = useState<ModelConfig[]>(mockModels.filter((model) => model.enabled))

	const handleModelToggle = (model: ModelConfig) => {
		setSelectedModels((prev) => {
			const isSelected = prev.some((m) => m.id === model.id)
			if (isSelected) {
				return prev.filter((m) => m.id !== model.id)
			} else {
				return [...prev, model]
			}
		})
	}

	const handleGroupToggle = (groupModels: ModelConfig[], allSelected: boolean) => {
		if (allSelected) {
			// 取消选择该组所有模型
			setSelectedModels((prev) => prev.filter((m) => !groupModels.some((gm) => gm.id === m.id)))
		} else {
			// 选择该组所有模型
			setSelectedModels((prev) => {
				const newModels = groupModels.filter((gm) => !prev.some((pm) => pm.id === gm.id))
				return [...prev, ...newModels]
			})
		}
	}

	const getSelectedCount = (groupModels: ModelConfig[]) => {
		return groupModels.filter((model) => selectedModels.some((sm) => sm.id === model.id)).length
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-2 mb-4">
				<span className="text-sm text-muted-foreground">已选择:</span>
				{selectedModels.map((model) => (
					<Badge key={model.id} variant="secondary" className="cursor-pointer" onClick={() => handleModelToggle(model)}>
						{model.name}
						<button className="ml-1 hover:bg-muted-foreground/20 rounded-full w-3 h-3 flex items-center justify-center text-xs">×</button>
					</Badge>
				))}
				{selectedModels.length === 0 && <span className="text-sm text-muted-foreground">未选择任何模型</span>}
			</div>

			<Accordion type="multiple" defaultValue={['silicon']}>
				{Object.entries(groupedModels).map(([platform, group]) => {
					const selectedCount = getSelectedCount(group.models)
					const allSelected = selectedCount === group.models.length
					const Icon = group.icon

					return (
						<AccordionItem key={platform} value={platform} className="border rounded-md">
							<AccordionTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted hover:no-underline">
								<div className="flex items-center gap-2">
									<Icon className="h-4 w-4" />
									<span className="font-medium">{group.title}</span>
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={(e) => {
											e.stopPropagation()
											handleGroupToggle(group.models, allSelected)
										}}
										className="h-6 px-2 text-xs"
									>
										{allSelected ? '取消全选' : '全选'}
									</Button>
									<Badge variant="outline" className="text-xs">
										{selectedCount}/{group.models.length}
									</Badge>
								</div>
							</AccordionTrigger>
							<AccordionContent className="pl-6 pt-2 pb-4 space-y-2">
								{group.models.map((model) => {
									const isSelected = selectedModels.some((sm) => sm.id === model.id)
									return (
										<div key={model.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md">
											<Checkbox id={model.id} checked={isSelected} onCheckedChange={() => handleModelToggle(model)} />
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<label htmlFor={model.id} className="font-medium cursor-pointer">
														{model.name}
													</label>
													<div className="flex gap-1">
														{model.pricing === 'free' && (
															<Badge variant="outline" className="text-xs">
																免费
															</Badge>
														)}
														{model.tags?.slice(0, 2).map((tag) => (
															<Badge key={tag} variant="secondary" className="text-xs">
																{tag}
															</Badge>
														))}
													</div>
												</div>
												{model.description && <p className="text-sm text-muted-foreground">{model.description}</p>}
											</div>
										</div>
									)
								})}
							</AccordionContent>
						</AccordionItem>
					)
				})}
			</Accordion>
		</div>
	)
}

// 下拉多选组件（基础版本）
const ModelMultiSelect = () => {
	const [selectedModels, setSelectedModels] = useState<ModelConfig[]>(mockModels.filter((model) => model.enabled))
	const [open, setOpen] = useState(false)

	const handleModelToggle = (model: ModelConfig) => {
		setSelectedModels((prev) => {
			const isSelected = prev.some((m) => m.id === model.id)
			if (isSelected) {
				return prev.filter((m) => m.id !== model.id)
			} else {
				return [...prev, model]
			}
		})
	}

	const removeModel = (modelId: string) => {
		setSelectedModels((prev) => prev.filter((m) => m.id !== modelId))
	}

	return (
		<div className="space-y-4">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant="outline" className="w-full justify-between">
						选择模型 ({selectedModels.length})
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-80 p-0" align="start">
					<Command>
						<CommandInput placeholder="搜索模型..." />
						<CommandEmpty>未找到模型</CommandEmpty>
						{Object.entries(groupedModels).map(([platform, group]) => (
							<CommandGroup key={platform} heading={group.title}>
								{group.models.map((model) => {
									const isSelected = selectedModels.some((sm) => sm.id === model.id)
									return (
										<CommandItem key={model.id} onSelect={() => handleModelToggle(model)}>
											<Check className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<span className="font-medium">{model.name}</span>
													{model.pricing === 'free' && (
														<Badge variant="outline" className="text-xs">
															免费
														</Badge>
													)}
												</div>
												{model.description && <p className="text-xs text-muted-foreground truncate">{model.description}</p>}
											</div>
										</CommandItem>
									)
								})}
							</CommandGroup>
						))}
					</Command>
				</PopoverContent>
			</Popover>

			{/* 已选择的模型标签 */}
			<div className="space-y-2">
				<span className="text-sm font-medium">已选择的模型:</span>
				<div className="flex flex-wrap gap-2">
					{selectedModels.map((model) => (
						<Badge key={model.id} variant="secondary" className="flex items-center gap-1">
							{model.name}
							<button onClick={() => removeModel(model.id)} className="ml-1 hover:bg-muted-foreground/20 rounded-full w-3 h-3 flex items-center justify-center text-xs">
								×
							</button>
						</Badge>
					))}
					{selectedModels.length === 0 && <span className="text-sm text-muted-foreground">未选择任何模型</span>}
				</div>
			</div>
		</div>
	)
}

// 下拉多选组件（级联菜单版本）
const ModelMultiSelectCascade = () => {
	const [selectedModels, setSelectedModels] = useState<ModelConfig[]>(mockModels.filter((model) => model.enabled))
	const [open, setOpen] = useState(false)
	const [hoveredGroup, setHoveredGroup] = useState<string | null>('silicon') // 默认选择第一个分组
	const [searchQuery, setSearchQuery] = useState('')
	const throttledSearchQuery = useThrottle(searchQuery, { wait: 300 })

	const handleModelToggle = (model: ModelConfig) => {
		setSelectedModels((prev) => {
			const isSelected = prev.some((m) => m.id === model.id)
			if (isSelected) {
				return prev.filter((m) => m.id !== model.id)
			} else {
				return [...prev, model]
			}
		})
	}

	const removeModel = (modelId: string) => {
		setSelectedModels((prev) => prev.filter((m) => m.id !== modelId))
	}

	const handleGroupToggle = (groupModels: ModelConfig[], allSelected: boolean) => {
		if (allSelected) {
			// 取消选择该组所有模型
			setSelectedModels((prev) => prev.filter((m) => !groupModels.some((gm) => gm.id === m.id)))
		} else {
			// 选择该组所有模型
			setSelectedModels((prev) => {
				const newModels = groupModels.filter((gm) => !prev.some((pm) => pm.id === gm.id))
				return [...prev, ...newModels]
			})
		}
	}

	const getSelectedCount = (groupModels: ModelConfig[]) => {
		return groupModels.filter((model) => selectedModels.some((sm) => sm.id === model.id)).length
	}

	// 过滤模型基于搜索查询（使用节流后的值）
	const filterModels = (models: ModelConfig[]) => {
		if (!throttledSearchQuery) return models
		return models.filter(
			(model) =>
				model.name.toLowerCase().includes(throttledSearchQuery.toLowerCase()) ||
				model.description?.toLowerCase().includes(throttledSearchQuery.toLowerCase()) ||
				model.tags?.some((tag) => tag.toLowerCase().includes(throttledSearchQuery.toLowerCase()))
		)
	}

	// 过滤分组（如果搜索后某分组没有模型，就不显示该分组）
	const filteredGroupedModels = Object.entries(groupedModels).reduce(
		(acc, [platform, group]) => {
			const filteredModels = filterModels(group.models)
			if (filteredModels.length > 0) {
				acc[platform] = { ...group, models: filteredModels }
			}
			return acc
		},
		{} as typeof groupedModels
	)

	return (
		<div className="space-y-4">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant="outline" className="w-full justify-between">
						选择模型 ({selectedModels.length})
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[600px] p-0" align="start">
					<div className="border-b p-2">
						<input
							type="text"
							placeholder="搜索模型..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>
					<div className="flex max-h-80">
						{/* 左侧一级菜单 */}
						<div
							className="w-48 border-r overflow-auto"
							onMouseLeave={() => {
								// 当鼠标离开左侧菜单区域时，不要重置选择
								// setHoveredGroup(null)
							}}
						>
							{Object.entries(filteredGroupedModels).map(([platform, group]) => {
								const selectedCount = getSelectedCount(group.models)
								const Icon = group.icon
								const isHovered = hoveredGroup === platform

								return (
									<div
										key={platform}
										className={cn('p-3 cursor-pointer border-b last:border-b-0 transition-colors', isHovered ? 'bg-muted' : 'hover:bg-muted/50')}
										onMouseEnter={() => setHoveredGroup(platform)}
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Icon className="h-4 w-4" />
												<span className="font-medium text-sm">{group.title}</span>
											</div>
											<div className="flex items-center gap-1">
												<Badge variant="outline" className="text-xs">
													{selectedCount}/{group.models.length}
												</Badge>
												<div className="w-1 h-1 rounded-full bg-primary" />
											</div>
										</div>
									</div>
								)
							})}
						</div>

						{/* 右侧二级菜单 */}
						<div className="flex-1 overflow-auto">
							{hoveredGroup && filteredGroupedModels[hoveredGroup] && (
								<div className="p-2">
									{/* 分组操作栏 */}
									<div className="flex items-center justify-between p-2 mb-2 bg-muted/30 rounded">
										<span className="text-sm font-medium">{filteredGroupedModels[hoveredGroup].title}</span>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												const group = filteredGroupedModels[hoveredGroup]
												const selectedCount = getSelectedCount(group.models)
												const allSelected = selectedCount === group.models.length
												handleGroupToggle(group.models, allSelected)
											}}
											className="h-6 px-2 text-xs"
										>
											{getSelectedCount(filteredGroupedModels[hoveredGroup].models) === filteredGroupedModels[hoveredGroup].models.length ? '取消全选' : '全选'}
										</Button>
									</div>

									{/* 模型列表 */}
									<div className="space-y-1">
										{filteredGroupedModels[hoveredGroup].models.map((model) => {
											const isSelected = selectedModels.some((sm) => sm.id === model.id)
											return (
												<div key={model.id} className="flex items-center p-2 hover:bg-muted rounded cursor-pointer" onClick={() => handleModelToggle(model)}>
													<Check className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2">
															<span className="font-medium text-sm">{model.name}</span>
															{model.pricing === 'free' && (
																<Badge variant="outline" className="text-xs">
																	免费
																</Badge>
															)}
															{model.tags?.slice(0, 2).map((tag) => (
																<Badge key={tag} variant="secondary" className="text-xs">
																	{tag}
																</Badge>
															))}
														</div>
														{model.description && <p className="text-xs text-muted-foreground truncate mt-1">{model.description}</p>}
													</div>
												</div>
											)
										})}
									</div>
								</div>
							)}
							{(!hoveredGroup || !filteredGroupedModels[hoveredGroup]) && (
								<div className="flex items-center justify-center h-full text-muted-foreground text-sm">{throttledSearchQuery ? '搜索结果为空' : '悬停左侧分组查看模型'}</div>
							)}
						</div>
					</div>
				</PopoverContent>
			</Popover>

			{/* 已选择的模型标签 */}
			<div className="space-y-2">
				<span className="text-sm font-medium">已选择的模型:</span>
				<div className="flex flex-wrap gap-2">
					{selectedModels.map((model) => (
						<Badge key={model.id} variant="secondary" className="flex items-center gap-1">
							{model.name}
							<button onClick={() => removeModel(model.id)} className="ml-1 hover:bg-muted-foreground/20 rounded-full w-3 h-3 flex items-center justify-center text-xs">
								×
							</button>
						</Badge>
					))}
					{selectedModels.length === 0 && <span className="text-sm text-muted-foreground">未选择任何模型</span>}
				</div>
			</div>
		</div>
	)
}

// 弹窗式级联菜单组件
const TestMultiSelectDialog = () => {
	const [selectedItems, setSelectedItems] = useState<string[]>(['DeepSeek R1', 'Qwen3-32B'])
	const [hoverChange, setHoverChange] = useState(false)

	// 简化的分组配置
	const simpleGroups = {
		'Silicon Flow': ['DeepSeek R1', 'GLM-4.1V-9B', 'Qwen3-32B', 'Hunyuan-A13B'],
		'OpenRouter (free)': ['DeepSeek Chat V3', 'DeepSeek R1', 'Kimi Dev 72B', 'Claude 3.5 Haiku'],
		'OpenRouter (paid)': ['GPT-4o', 'Claude 3.5 Sonnet', 'Gemini Pro', 'GPT-4 Turbo'],
		'Mock Models': ['Test Model A', 'Test Model B', 'Test Model C'],
	}

	return (
		<div className="space-y-4">
			{/* 交互模式控制 */}
			<div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
				<label className="text-sm font-medium">交互模式:</label>
				<div className="flex items-center gap-2">
					<Switch id="hover-change" checked={hoverChange} onCheckedChange={setHoverChange} />
					<label htmlFor="hover-change" className="text-sm">
						{hoverChange ? '悬停切换' : '点击切换'}
					</label>
				</div>
				<span className="text-xs text-muted-foreground">{hoverChange ? '鼠标悬停在左侧分组上即可切换' : '需要点击左侧分组才能切换'}</span>
			</div>

			{/* 通用组件 */}
			<MultiSelectDialog value={selectedItems} onChange={setSelectedItems} hoverChange={hoverChange} groups={simpleGroups} triggerText="选择AI模型" dialogTitle="选择AI模型" />
		</div>
	)
}

// 当前的按钮平铺方式对比
const CurrentButtonSelector = () => {
	const [selectedModels, setSelectedModels] = useState<ModelConfig[]>(mockModels.filter((model) => model.enabled))

	const handleToggle = (model: ModelConfig) => {
		setSelectedModels((prev) => {
			const isSelected = prev.some((m) => m.id === model.id)
			if (isSelected) {
				return prev.filter((m) => m.id !== model.id)
			} else {
				return [...prev, model]
			}
		})
	}

	return (
		<div className="space-y-4">
			<div className="text-sm text-muted-foreground mb-2">当前方式：所有模型平铺显示 ({mockModels.length} 个模型)</div>
			<div className="flex flex-wrap gap-2">
				{mockModels.map((model) => {
					const isSelected = selectedModels.some((m) => m.id === model.id)
					return (
						<Button key={model.id} onClick={() => handleToggle(model)} variant={isSelected ? 'default' : 'outline'} size="sm" className="rounded-full">
							{model.name}
						</Button>
					)
				})}
			</div>
			<div className="text-sm text-muted-foreground">已选择 {selectedModels.length} 个模型</div>
		</div>
	)
}

export const TestMultiSelector = () => {
	return (
		<div className="space-y-8 p-6">
			{/* 当前方式对比 */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						当前方式：按钮平铺
					</CardTitle>
					<CardDescription>当前 Chat Hub 使用的模型选择方式 - 存在空间占用大、视觉混乱等问题</CardDescription>
				</CardHeader>
				<CardContent>
					<CurrentButtonSelector />
				</CardContent>
			</Card>

			{/* 方案1：分组可折叠选择器 */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Layers className="h-5 w-5" />
						方案1：分组可折叠选择器（推荐）
					</CardTitle>
					<CardDescription>按平台分组，可折叠设计，支持批量选择，节省空间且逻辑清晰</CardDescription>
				</CardHeader>
				<CardContent>
					<ModelGroupSelector />
				</CardContent>
			</Card>

			{/* 方案2：下拉多选 */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Database className="h-5 w-5" />
						方案2：下拉多选 + 标签显示
					</CardTitle>
					<CardDescription>下拉选择器配合搜索，已选择项通过标签展示，支持快速删除</CardDescription>
				</CardHeader>
				<CardContent>
					<ModelMultiSelect />
				</CardContent>
			</Card>

			{/* 方案3：下拉多选级联菜单 */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Layers className="h-5 w-5" />
						方案3：下拉多选 + 级联菜单
					</CardTitle>
					<CardDescription>级联菜单设计，左侧一级分组，右侧二级模型列表，悬停切换分组</CardDescription>
				</CardHeader>
				<CardContent>
					<ModelMultiSelectCascade />
				</CardContent>
			</Card>

			{/* 方案4：弹窗式级联菜单 */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						方案4：弹窗式级联菜单
					</CardTitle>
					<CardDescription>弹窗形式，上中下布局：搜索框 + 级联菜单 + 标签区域，最大化显示空间</CardDescription>
				</CardHeader>
				<CardContent>
					<TestMultiSelectDialog />
				</CardContent>
			</Card>

			{/* 对比总结 */}
			<Card>
				<CardHeader>
					<CardTitle>方案对比总结</CardTitle>
					<CardDescription>各种方案的优劣分析</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
						<div className="space-y-2">
							<h4 className="font-medium text-red-600">当前方案问题</h4>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• 占用大量垂直空间</li>
								<li>• 模型多时视觉混乱</li>
								<li>• 无分类，难以查找</li>
								<li>• 扩展性差</li>
							</ul>
						</div>
						<div className="space-y-2">
							<h4 className="font-medium text-green-600">方案1优势</h4>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• 按平台分组清晰</li>
								<li>• 可折叠节省空间</li>
								<li>• 支持批量操作</li>
								<li>• 保持直观的多选</li>
							</ul>
						</div>
						<div className="space-y-2">
							<h4 className="font-medium text-blue-600">方案2优势</h4>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• 最大化节省空间</li>
								<li>• 支持搜索过滤</li>
								<li>• 标签展示已选择</li>
								<li>• 快速删除选择</li>
							</ul>
						</div>
						<div className="space-y-2">
							<h4 className="font-medium text-purple-600">方案3优势</h4>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• 级联菜单清晰分层</li>
								<li>• 悬停切换分组快速</li>
								<li>• 大屏幕空间充分利用</li>
								<li>• 支持搜索和批量操作</li>
							</ul>
						</div>
						<div className="space-y-2">
							<h4 className="font-medium text-orange-600">方案4优势</h4>
							<ul className="text-sm text-muted-foreground space-y-1">
								<li>• 弹窗最大化显示空间</li>
								<li>• 上中下布局结构清晰</li>
								<li>• 固定高度便于操作</li>
								<li>• 一键清空快速管理</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
