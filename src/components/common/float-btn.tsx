import { cn } from '@/lib/utils'
import { DndContext, DragEndEvent, PointerSensor, useDraggable, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { useMemoizedFn } from 'ahooks'
import { useState, useEffect } from 'react'

const dragId = 'float-button'

interface DraggableButtonProps {
	title: string
	pos: { x: number; y: number }
	onClick: () => void
	isDragging: boolean
	className?: string
}

const DraggableButton = (props: DraggableButtonProps) => {
	const { title, pos, onClick, isDragging, className } = props
	const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: dragId })

	const style = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
				left: pos.x,
				top: pos.y,
			}
		: {
				left: pos.x,
				top: pos.y,
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
 * 悬浮按钮组件
 */
export const FloatBtn = (props: FloatBtnProps) => {
	const { title = 'GM', onClick, defaultPos = { x: 20, y: 20 }, className } = props

	const [pos, setPos] = useState(defaultPos)
	const [isDragging, setIsDragging] = useState(false)

	// 生成存储key，基于title来区分不同的悬浮按钮
	const storageKey = `float-btn-pos-${title.toLowerCase()}`

	// 从存储中恢复位置
	useEffect(() => {
		try {
			const savedPosStr = localStorage.getItem(storageKey)
			if (savedPosStr) {
				const savedPos = JSON.parse(savedPosStr) as { x: number; y: number }
				setPos(savedPos)
			}
		} catch (error) {
			console.warn(`[FloatBtn] Failed to restore position for ${title}:`, error)
		}
	}, [storageKey, title])

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
				const newPos = { x: rect.left, y: rect.top }
				// 更新位置状态为拖拽后的最终位置
				setPos(newPos)
				// 保存位置到 localStorage
				try {
					localStorage.setItem(storageKey, JSON.stringify(newPos))
				} catch (error) {
					console.warn(`[FloatBtn] Failed to save position for ${title}:`, error)
				}
			}
		}
	})

	// 处理拖拽开始
	const handleDragStart = useMemoizedFn(() => {
		setIsDragging(true)
	})

	// 处理按钮点击
	const handleButtonClick = useMemoizedFn(() => {
		// 只有在非拖拽状态下才触发点击事件
		if (!isDragging) {
			onClick?.()
		}
	})

	return (
		<DndContext sensors={sensors} modifiers={[restrictToWindowEdges]} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
			<DraggableButton title={title} pos={pos} onClick={handleButtonClick} isDragging={isDragging} className={className} />
		</DndContext>
	)
}

export interface FloatBtnProps {
	title?: string
	onClick?: () => void
	defaultPos?: { x: number; y: number }
	className?: string
}
