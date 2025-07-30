import { Button } from '@/components/ui/button'
import { feedUtil } from '../feed-util'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 信息流文本组件 - 支持长内容折叠和展开
 */
export const FeedText = (props: FeedTextProps) => {
	const { content, isExpanded, onToggleExpand, className } = props

	if (!content) return null

	const needsTruncate = feedUtil.needsTruncate(content)
	const displayContent = needsTruncate && !isExpanded ? feedUtil.truncateContent(content) : content

	return (
		<div className={cn('space-y-2', className)} data-slot="feed-text">
			{/* 文本内容区域 */}
			<div className="text-sm text-foreground leading-relaxed">
				<AnimatePresence mode="wait">
					<motion.div
						key={isExpanded ? 'expanded' : 'collapsed'}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="whitespace-pre-wrap break-words"
						style={{ maxWidth: '100%', wordBreak: 'break-word' }} // 防止渲染过大
					>
						{displayContent}
					</motion.div>
				</AnimatePresence>
			</div>

			{/* 展开收起按钮 */}
			{needsTruncate && (
				<Button
					variant="ghost"
					size="sm"
					className="h-auto p-0 text-xs text-primary hover:text-primary/80 font-normal"
					onClick={(e) => {
						e.stopPropagation()
						onToggleExpand()
					}}
				>
					{isExpanded ? '收起' : '展开全文'}
				</Button>
			)}
		</div>
	)
}

export interface FeedTextProps {
	content: string
	isExpanded: boolean
	onToggleExpand: () => void
	className?: string
}
