import { useInterval, useUnmount } from 'ahooks'
import { CSSProperties, useState } from 'react'

/**
 * 加载的点动画
 */
export const LoadingDot = (props: LoadingDotProps) => {
	const { count = 3, duration = 1500, className, style } = props
	const [dotCount, setDotCount] = useState(0)

	useInterval(() => {
		setDotCount((prev) => (prev + 1) % count)
	}, duration / count)

	useUnmount(() => {
		setDotCount(0)
	})

	return (
		<div className={className} style={style} data-slot="loading-dot">
			{Array.from({ length: dotCount }).map((_, i) => (
				<div key={i}>.</div>
			))}
		</div>
	)
}

export interface LoadingDotProps {
	count?: number
	duration?: number // 毫秒
	className?: string
	style?: CSSProperties
}
