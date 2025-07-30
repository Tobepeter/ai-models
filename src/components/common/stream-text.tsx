import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CSSProperties, useRef, useEffect } from 'react'
import { useMount, usePrevious } from 'ahooks'

/**
 * 流式文本组件
 */
export const StreamText = (props: StreamTextProps) => {
	const { content, className, style, duration = 1 } = props
	const prevContent = usePrevious(content) || ''
	const characters = content.split('')

	return (
		<span className={cn('whitespace-pre-wrap', className)} style={style} data-slot="stream-text">
			{characters.map((char, idx) => {
				// 判断是否是新增的字符（超出上次内容长度的字符）
				const isNewChar = idx >= prevContent.length

				return (
					<motion.span
						key={`char-${idx}`}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{
							duration,
							ease: 'easeOut',
						}}
					>
						{char}
					</motion.span>
				)
			})}
		</span>
	)
}

export interface StreamTextProps {
	content: string
	className?: string
	duration?: number // 毫秒
	style?: CSSProperties
}
