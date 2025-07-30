import { useMount } from 'ahooks'
import { motion } from 'framer-motion'
import { CSSProperties, PropsWithChildren, useRef, useEffect, useState } from 'react'

export const Shimmer = (props: PropsWithChildren<ShimmerProps>) => {
	const { className, style, duration = 1500, shimmerColor } = props
	const divRef = useRef<HTMLDivElement>(null)
	const [computedColor, setComputedColor] = useState('#fff')

	// 读取容器的文字色
	useMount(() => {
		if (divRef.current) {
			const color = getComputedStyle(divRef.current).getPropertyValue('color').trim()
			setComputedColor(color)
		}
	})

	// 必须是两倍，类似轮播图效果
	const backgroundSize = `200% 100%`
	const finalShimmerColor = shimmerColor || computedColor
	const backgroundImage = `linear-gradient(to right, currentColor, ${finalShimmerColor}, currentColor)`

	/**
	 * 正到负数
	 *
	 * 这个其实背景是循环的
	 * 比如 x 提供负数，可以看到左侧，视觉效果是往右翻动的感觉
	 * 一般我们shimmer的效果都是从左到右
	 *
	 */
	const animate = { backgroundPosition: [`100% 0`, `-100% 0`] }
	const ease = 'easeInOut'

	return (
		<div ref={divRef} className={className} style={style}>
			<motion.span
				className="text-transparent bg-clip-text"
				// className="text-transparent"
				style={{
					backgroundSize,
					backgroundImage,
					// backgroundPosition: '100% 0'
				}}
				animate={animate}
				transition={{ duration: duration / 1000, ease, repeat: Infinity }}
			>
				{props.children}
			</motion.span>
		</div>
	)
}

export interface ShimmerProps {
	className?: string
	style?: CSSProperties
	duration?: number // 毫秒
	shimmerColor?: string // 可选，如果不传则自动读取容器的文字色
}
