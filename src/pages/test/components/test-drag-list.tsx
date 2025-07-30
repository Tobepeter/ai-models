import { DragList, type DragListItem } from '@/components/common/drag-list'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

// 简单模式数据
interface SimpleItem extends DragListItem {
	title: string
}

const simpleItems: SimpleItem[] = [
	{ id: '1', title: '设计用户界面' },
	{ id: '2', title: '实现拖拽功能' },
	{ id: '3', title: '编写测试用例' },
	{ id: '4', title: '优化性能' },
	{ id: '5', title: '更新文档' },
]

// 复杂模式数据
interface ComplexItem extends DragListItem {
	title: string
	description: string
	priority: 'low' | 'medium' | 'high'
	completed: boolean
	dueDate?: string
}

const complexItems: ComplexItem[] = [
	{
		id: '1',
		title: '设计用户界面',
		description: '完成新功能的UI设计稿',
		priority: 'high',
		completed: false,
		dueDate: '2024-01-15',
	},
	{
		id: '2',
		title: '实现拖拽功能',
		description: '使用 dnd-kit 实现列表拖拽排序',
		priority: 'medium',
		completed: true,
	},
	{
		id: '3',
		title: '编写测试用例',
		description: '为新功能编写单元测试和集成测试',
		priority: 'medium',
		completed: false,
		dueDate: '2024-01-20',
	},
	{
		id: '4',
		title: '优化性能',
		description: '分析并优化应用的加载性能',
		priority: 'low',
		completed: false,
	},
]

const ComplexItemRenderer = (item: ComplexItem) => {
	const priorityConfig = {
		high: { color: 'destructive', icon: AlertCircle, label: '高' },
		medium: { color: 'default', icon: Clock, label: '中' },
		low: { color: 'secondary', icon: CheckCircle2, label: '低' },
	} as const

	const config = priorityConfig[item.priority]

	return (
		<div className={`w-full ${item.completed ? 'opacity-75' : ''}`} data-slot="complex-item-renderer">
			<div className="flex items-center gap-2 mb-2">
				<h3 className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.title}</h3>
				<Badge variant={config.color as any} className="text-xs">
					<config.icon className="h-3 w-3 mr-1" />
					{config.label}
				</Badge>
				{item.completed && (
					<Badge variant="outline" className="text-xs text-green-600">
						✓ 已完成
					</Badge>
				)}
			</div>

			<p className="text-sm text-muted-foreground mb-2">{item.description}</p>

			{item.dueDate && (
				<div className="flex items-center gap-1 text-xs text-muted-foreground">
					<Clock className="h-3 w-3" />
					截止: {new Date(item.dueDate).toLocaleDateString()}
				</div>
			)}
		</div>
	)
}

const TestDragList = () => {
	// 简单模式：非受控
	const [simpleControlledItems, setSimpleControlledItems] = useState(simpleItems)

	// 复杂模式：受控
	const [complexControlledItems, setComplexControlledItems] = useState(complexItems)

	const handleSimpleReset = () => {
		setSimpleControlledItems([...simpleItems])
	}

	const handleComplexReset = () => {
		setComplexControlledItems([...complexItems])
	}

	return (
		<div className="p-6 max-w-4xl mx-auto space-y-8" data-slot="test-drag-list">
			<div>
				<h2 className="text-2xl font-bold mb-2">通用拖拽列表组件测试</h2>
				<p className="text-muted-foreground">演示 DragList 组件的简单模式和自定义渲染模式</p>
			</div>

			{/* 简单模式 */}
			<div>
				<div className="mb-4">
					<div className="flex items-center gap-3 mb-2">
						<h3 className="text-lg font-semibold">简单模式（受控）</h3>
						<Button onClick={handleSimpleReset} variant="outline" size="sm">
							重置
						</Button>
					</div>
					<p className="text-sm text-muted-foreground">使用默认渲染器，只显示标题</p>
				</div>

				<DragList items={simpleControlledItems} onItemsChange={setSimpleControlledItems} className="max-w-md" />
			</div>

			<Separator />

			{/* 非受控模式 */}
			<div>
				<div className="mb-4">
					<h3 className="text-lg font-semibold">非受控模式</h3>
					<p className="text-sm text-muted-foreground">使用 defaultItems，组件内部管理状态</p>
				</div>

				<DragList defaultItems={simpleItems} onItemsChange={(items) => console.log('非受控模式变化:', items)} className="max-w-md" />
			</div>

			<Separator />

			{/* 自定义渲染模式 */}
			<div>
				<div className="mb-4">
					<div className="flex items-center gap-3 mb-2">
						<h3 className="text-lg font-semibold">自定义渲染模式（受控）</h3>
						<Button onClick={handleComplexReset} variant="outline" size="sm">
							重置
						</Button>
					</div>
					<p className="text-sm text-muted-foreground">使用自定义渲染器，展示复杂的任务卡片</p>
				</div>

				<DragList items={complexControlledItems} onItemsChange={setComplexControlledItems} renderItem={ComplexItemRenderer} className="max-w-2xl" />
			</div>

			{/* 使用说明 */}
			<div className="mt-8 p-4 bg-muted rounded-lg">
				<h3 className="font-medium mb-2">使用说明:</h3>
				<div className="text-sm text-muted-foreground space-y-1">
					<p>
						<strong>受控模式</strong>: 传递 `items` + `onItemsChange`，外部管理状态
					</p>
					<p>
						<strong>非受控模式</strong>: 传递 `defaultItems`，组件内部管理状态
					</p>
					<p>
						<strong>简单渲染</strong>: 不传 `renderItem`，使用默认的标题显示
					</p>
					<p>
						<strong>自定义渲染</strong>: 传递 `renderItem` 函数，完全自定义外观
					</p>
					<p>
						<strong>样式定制</strong>: 通过 `className` 和 `itemClassName` 控制样式
					</p>
				</div>
			</div>
		</div>
	)
}
export default TestDragList
