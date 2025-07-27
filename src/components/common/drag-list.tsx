import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { ReactNode, useCallback, useState } from 'react'
import { cn } from '@/lib/utils'

export interface DragListItem {
	id: string
	title?: string
	description?: string
}

export interface DragListProps<T extends DragListItem> {
	items?: T[] // 受控模式
	defaultItems?: T[] // 非受控模式
	onItemsChange?: (items: T[]) => void
	onItemMove?: (fromIndex: number, toIndex: number, item: T) => void // 移动回调，提供移动信息
	renderItem?: (item: T) => ReactNode
	className?: string
	itemClassName?: string
	activationDistance?: number
}

// 内部item传递的参数
interface SortableItemProps<T extends DragListItem> {
	item: T
	renderItem?: (item: T) => React.ReactNode
	isDragging?: boolean
	className?: string
}

interface DragItemProps<T extends DragListItem> extends SortableItemProps<T> {
	[key: string]: any // dnd-kit 的 attributes 和 listeners
}

const DragItem = <T extends DragListItem>(props: DragItemProps<T>) => {
	const { item, renderItem, isDragging = false, className = '', ...domProps } = props
	const rootClassName = cn('transition-all duration-200 hover:shadow-md', isDragging ? 'shadow-2xl border-2 border-primary/20 cursor-grabbing' : '', className)
	return (
		<Card className={rootClassName}>
			<CardContent className="p-3">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="sm" className="p-1 h-auto cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100" {...domProps}>
						<GripVertical className="h-4 w-4" />
					</Button>
					<div className="flex-1">
						{renderItem ? (
							renderItem(item)
						) : (
							<div>
								<div className="font-medium">{item.title || item.id}</div>
								{item.description && <div className="text-sm text-muted-foreground mt-1">{item.description}</div>}
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

// 内部附带排序上下文的Item包裹组件
const SortableItem = <T extends DragListItem>(props: SortableItemProps<T>) => {
	const { item, renderItem, className } = props
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
	const style = { transform: CSS.Transform.toString(transform), transition }

	return (
		<div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
			<DragItem item={item} renderItem={renderItem} className={className} {...attributes} {...listeners} />
		</div>
	)
}

// Item 拖拽时候虚拟的Overlay组件
const DragOverlayItem = <T extends DragListItem>(props: SortableItemProps<T>) => {
	return <DragItem {...props} isDragging />
}

/* 通用拖拽列表组件 - 支持受控/非受控模式、自定义渲染、完全可定制样式 */
export const DragList = <T extends DragListItem>(props: DragListProps<T>) => {
	const { items, defaultItems, onItemsChange, onItemMove, renderItem, className = '', itemClassName = '', activationDistance = 3 } = props
	const [internal, setInternal] = useState<T[]>(defaultItems || [])
	const curr = items || internal
	const setCurr = useCallback(
		(newItems: T[] | ((prev: T[]) => T[])) => {
			if (items) {
				const final = typeof newItems === 'function' ? newItems(curr) : newItems
				onItemsChange?.(final)
			} else {
				setInternal(newItems)
				const final = typeof newItems === 'function' ? newItems(internal) : newItems
				onItemsChange?.(final)
			}
		},
		[items, curr, internal, onItemsChange]
	)

	const [active, setActive] = useState<T | null>(null)
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: activationDistance } }))

	const handleStart = useCallback(
		(event: DragStartEvent) => {
			const item = curr.find((item) => item.id === event.active.id)
			setActive(item || null)
		},
		[curr]
	)

	const handleEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event
			if (over && active.id !== over.id) {
				const oldIdx = curr.findIndex((item) => item.id === active.id)
				const newIdx = curr.findIndex((item) => item.id === over.id)
				const item = curr[oldIdx]
				
				setCurr((items) => arrayMove(items, oldIdx, newIdx))
				onItemMove?.(oldIdx, newIdx, item)
			}
			setActive(null)
		},
		[setCurr, curr, onItemMove]
	)

	return (
		<div className={className}>
			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleStart} onDragEnd={handleEnd}>
				<SortableContext items={curr.map((item) => item.id)} strategy={verticalListSortingStrategy}>
					<div className="space-y-3">
						{curr.map((item) => (
							<SortableItem key={item.id} item={item} renderItem={renderItem} className={itemClassName} />
						))}
					</div>
				</SortableContext>
				<DragOverlay>{active && <DragOverlayItem item={active} renderItem={renderItem} className={itemClassName} />}</DragOverlay>
			</DndContext>
		</div>
	)
}
