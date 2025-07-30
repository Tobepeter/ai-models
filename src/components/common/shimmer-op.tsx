import { useState } from 'react'
import { useInterval } from 'ahooks'
import { cn } from '@/lib/utils'

/**
 * shimmer
 * 基于 opacity 实现
 */
export const ShimmerOp = (props: ShimmerOpProps) => {
	const { text, range = 4, duration = 50, transitionDur = 100, className } = props
	const [currIndex, setCurrIndex] = useState(-range)
	const minOp = 0.2

	useInterval(() => {
		setCurrIndex((prev) => {
			const next = prev + 1
			if (next >= text.length + range) {
				return 0
			}
			return next
		})
	}, duration)

	const getOpacity = (index: number) => {
		const distance = Math.abs(index - currIndex)
		if (distance > range) return 1
		const ratio = distance / range
		return minOp + (1 - minOp) * ratio
	}

	return (
		<div className={cn('flex flex-wrap', className)}>
			{text.split('').map((char, index) => (
				<span key={index} className="transition-opacity" style={{ opacity: getOpacity(index), transitionDuration: `${transitionDur}ms` }}>
					{char}
				</span>
			))}
		</div>
	)
}

export interface ShimmerOpProps {
	text: string
	range?: number // 影响周围n个字
	duration?: number // 毫秒，索引递增间隔时间
	transitionDur?: number // 毫秒，过渡动画时间
	className?: string
}
