import { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { StreamText } from '@/components/common/stream-text'

/**
 * 文本组件，支持流式和普通展示
 */
export const ChatText = (props: ChatTextProps) => {
	const { content, className, style, isStream = false } = props

	if (isStream) {
		return <StreamText content={content} className={className} style={style} />
	}

	return (
		<div className={cn('text-sm whitespace-pre-wrap', className)} style={style}>
			{content}
		</div>
	)
}
export type ChatTextProps = {
	content: string
	className?: string
	style?: CSSProperties
	isStream?: boolean
}
