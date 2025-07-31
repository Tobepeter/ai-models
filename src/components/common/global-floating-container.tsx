import { useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { computePosition, autoPlacement, offset, flip, shift } from '@floating-ui/dom'
import { useGlobalFloatingStore } from '@/store/global-floating-store'
import { cn } from '@/lib/utils'

/**
 * 全局浮动容器 - 通过 Portal 传送内容到 body
 */
export const GlobalFloatingContainer = () => {
	const { activeContentId, content, position, triggerElement, config, hide, updatePosition } = useGlobalFloatingStore()
	const floatingRef = useRef<HTMLDivElement>(null)

	// 计算和更新位置
	const computeFloatingPosition = async () => {
		if (!triggerElement || !floatingRef.current) return

		const { x, y } = await computePosition(triggerElement, floatingRef.current, {
			placement: config?.placement || 'bottom-start',
			middleware: [offset(config?.offset || 8), flip(), shift({ padding: 8 }), autoPlacement({ allowedPlacements: ['bottom-start', 'top-start', 'bottom-end', 'top-end'] })],
		})

		updatePosition({ x, y })
	}

	// 初始位置计算
	useLayoutEffect(() => {
		if (activeContentId && triggerElement) {
			computeFloatingPosition()
		}
	}, [activeContentId, triggerElement])

	// 监听滚动和窗口大小变化
	useEffect(() => {
		if (!activeContentId || !config?.closeOnScroll) return

		const handleScroll = () => {
			if (config.closeOnScroll) {
				hide() // 滚动时直接关闭
			} else {
				computeFloatingPosition() // 或者重新计算位置
			}
		}

		const handleResize = () => {
			computeFloatingPosition()
		}

		// 监听各种滚动容器
		window.addEventListener('scroll', handleScroll, true) // 捕获阶段监听所有滚动
		window.addEventListener('resize', handleResize)

		return () => {
			window.removeEventListener('scroll', handleScroll, true)
			window.removeEventListener('resize', handleResize)
		}
	}, [activeContentId, config, hide])

	// 处理蒙层点击
	const handleOverlayClick = () => {
		hide()
	}

	// 阻止浮动内容点击事件冒泡
	const handleContentClick = (e: React.MouseEvent) => {
		e.stopPropagation()
	}

	if (!activeContentId || !content) {
		return null
	}

	return createPortal(
		<div className="fixed inset-0 z-[998]" data-slot="global-floating-container">
			{/* 全屏蒙层 */}
			<div className="absolute inset-0 bg-transparent cursor-default" onClick={handleOverlayClick} data-slot="floating-overlay" />

			{/* 浮动内容 */}
			<div
				ref={floatingRef}
				className={cn(
					'absolute z-[999] origin-top-left',
					'transition-all duration-200 ease-out',
					'opacity-100 scale-100' // 进入动画
				)}
				style={{
					left: position?.x || 0,
					top: position?.y || 0,
				}}
				onClick={handleContentClick}
				data-slot="floating-content"
			>
				{content}
			</div>
		</div>,
		document.body
	)
}
