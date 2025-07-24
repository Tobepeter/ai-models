import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { DndContext, DragEndEvent, PointerSensor, useDraggable, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { useMemoizedFn } from 'ahooks'
import { ReactNode, useState } from 'react'

const dragId = 'gm-button'

// 可拖拽按钮组件
const DraggableButton = (props: { title: string; pos: { x: number; y: number }; onClick: () => void; isDragging: boolean; className?: string }) => {
	const { title, pos: position, onClick, isDragging, className } = props

	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: dragId,
	})

	const style = {
		// 让 dnd-kit 完全管理位置，不混用 position 状态
		transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
		// 使用 CSS 定位作为初始位置
		left: position.x,
		top: position.y,
		willChange: 'transform',
	}

	return (
		<button
			ref={setNodeRef}
			style={style}
			className={cn(
				'fixed z-50 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg',
				'flex items-center justify-center text-sm font-bold',
				'hover:bg-primary/90 active:bg-primary/80',
				'transition-colors duration-200',
				'select-none cursor-pointer',
				isDragging && 'cursor-grabbing',
				className
			)}
			onClick={onClick}
			{...attributes}
			{...listeners}
		>
			{title}
		</button>
	)
}

/**
 * GM 面板
 */
export const GMPanel = (props: GMPanelProps) => {
	const { title = 'GM', config, defaultPos: defaultPosition = { x: 20, y: 20 }, className } = props

	const [isOpen, setIsOpen] = useState(false)
	const [pos, setPosition] = useState(defaultPosition)
	const [isDragging, setIsDragging] = useState(false)

	// 配置 sensors，设置激活约束，只有拖拽距离超过 5px 才开始拖拽
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5, // 拖拽距离超过 5px 才激活拖拽
			},
		})
	)

	// 处理拖拽结束
	const handleDragEnd = useMemoizedFn((event: DragEndEvent) => {
		setIsDragging(false)

		// 获取拖拽后的最终位置（已经被 modifier 约束过）
		if (event.over || event.delta) {
			const rect = event.active.rect.current.translated
			if (rect) {
				// 更新位置状态为拖拽后的最终位置
				setPosition({ x: rect.left, y: rect.top })
			}
		}
	})

	// 处理拖拽开始
	const handleDragStart = useMemoizedFn(() => {
		setIsDragging(true)
	})

	// 处理按钮点击
	const handleButtonClick = useMemoizedFn(() => {
		// 如果正在拖拽，不触发点击
		if (isDragging) return
		setIsOpen(true)
	})

	// 处理弹窗关闭
	const handleDialogClose = useMemoizedFn(() => {
		setIsOpen(false)
	})

	// 渲染配置项
	const renderConfigItem = (item: GMConfigItem, index: number) => {
		const { type, label, value, onClick, onChange, renderer, disabled, loading } = item

		if (type === 'custom' && renderer) {
			return (
				<div key={index} className="py-2">
					{renderer()}
				</div>
			)
		}

		switch (type) {
			case 'button':
				return (
					<div key={index} className="py-2">
						<Button onClick={onClick} className="w-full" disabled={disabled || loading} variant="outline">
							{loading ? '执行中...' : label}
						</Button>
					</div>
				)

			case 'switch':
				return (
					<div key={index} className="py-2 flex items-center justify-between">
						<span className="text-sm font-medium">{label}</span>
						<Switch checked={value} onCheckedChange={onChange} disabled={disabled} />
					</div>
				)

			case 'badge':
				return (
					<div key={index} className="py-2 flex items-center justify-between">
						<span className="text-sm font-medium">{label}</span>
						<Badge variant="secondary">{value}</Badge>
					</div>
				)

			default:
				return null
		}
	}

	return (
		<DndContext sensors={sensors} modifiers={[restrictToWindowEdges]} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
			{/* 可拖拽小按钮 */}
			<DraggableButton title={title} pos={pos} onClick={handleButtonClick} isDragging={isDragging} className={className} />

			{/* shadcn Dialog 弹窗 */}
			<Dialog open={isOpen} onOpenChange={handleDialogClose}>
				<DialogContent className="max-w-md max-h-[80vh]">
					<DialogHeader>
						<DialogTitle>{title} Panel</DialogTitle>
					</DialogHeader>

					<ScrollArea className="max-h-[60vh] pr-4">
						<div className="space-y-3">{config.map((item, index) => renderConfigItem(item, index))}</div>
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</DndContext>
	)
}

export interface GMPanelProps {
	title?: string
	config: GMConfigItem[]
	defaultPos?: { x: number; y: number }
	className?: string
}

// 配置项类型定义
export interface GMConfigItem {
	type: 'button' | 'switch' | 'badge' | 'custom'
	label?: string
	value?: any
	onClick?: () => void
	onChange?: (value: any) => void
	renderer?: () => ReactNode
	disabled?: boolean
	loading?: boolean
}
