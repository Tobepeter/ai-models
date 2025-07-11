import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CSSProperties, useRef, useEffect } from 'react'

/** 流式文本组件 - 优化版，避免闪烁 */
export const StreamText = (props: StreamTextProps) => {
	const { content, className, style } = props
	const prevContentRef = useRef('')

	// 记录上次的内容，用于判断哪些字符是新增的
	useEffect(() => {
		prevContentRef.current = content
	})

	const prevContent = prevContentRef.current
	const characters = content.split('')

	return (
		<span className={cn('whitespace-pre-wrap', className)} style={style}>
			{characters.map((char, idx) => {
				// 判断是否是新增的字符（超出上次内容长度的字符）
				const isNewChar = idx >= prevContent.length

				return (
					<motion.span
						key={`char-${idx}`}
						initial={isNewChar ? { opacity: 0 } : false} // 已存在的字符不需要初始状态
						animate={{ opacity: 1 }}
						transition={{
							duration: isNewChar ? 0.15 : 0, // 只对新字符应用动画
							ease: 'easeOut'
						}}
					>
						{char}
					</motion.span>
				)
			})}
		</span>
	)
}

export type StreamTextProps = {
	content: string
	className?: string
	duration?: number // 毫秒
	style?: CSSProperties
}
