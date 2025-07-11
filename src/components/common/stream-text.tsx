import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CSSProperties } from 'react'

/**
 * 流式文本组件
 */
export const StreamText = (props: StreamTextProps) => {
	const { content, className, duration = 1000, style } = props
	const characters = content.split('')

	return (
		<p className={cn('text-sm whitespace-pre-wrap', className)} style={style}>
			{characters.map((char, index) => (
				<motion.span key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: duration / 1000 }}>
					{char}
				</motion.span>
			))}
		</p>
	)
}

export type StreamTextProps = {
	content: string
	className?: string
	duration?: number // 毫秒
	style?: CSSProperties
}
