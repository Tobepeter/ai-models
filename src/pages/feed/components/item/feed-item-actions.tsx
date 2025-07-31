import { Button } from '@/components/ui/button'
import { Heart, Share, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CommentInputPopup } from '../comment/feed-comment-input-popup'
import { feedUtil } from '../../feed-util'
import { cn } from '@/lib/utils'
import { useMemoizedFn } from 'ahooks'
import { useMemo } from 'react'

/**
 * 信息流交互按钮组件 - 包含点赞、评论、分享功能
 */
export const FeedItemActions = (props: FeedItemActionsProps) => {
	const { postId, likeCount, commentCount, isLiked, onLike, onAddComment, replyTo, className } = props

	// 缓存格式化后的数字，避免重复计算
	const formattedLikeCount = useMemo(() => feedUtil.formatCount(likeCount), [likeCount])

	const handleLike = useMemoizedFn((e: React.MouseEvent) => {
		e.stopPropagation()
		onLike(postId)
	})

	const handleShare = useMemoizedFn((e: React.MouseEvent) => {
		e.stopPropagation()
		console.log('分享:', postId) // TODO: 实现分享功能
	})

	return (
		<div
			className={cn('flex items-center space-x-4 pt-2', className)}
			onClick={(e) => e.stopPropagation()}
			data-slot="feed-actions" // 阻止冒泡到父级点击事件
		>
			{/* 点赞 */}
			<Button
				variant="ghost"
				size="sm"
				className={cn('h-8 px-2 min-w-[60px] justify-start transition-colors', isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500')}
				onClick={handleLike}
			>
				{/* 点赞爱心 - 简化动画，只保留缩放 */}
				<motion.div whileTap={{ scale: 1.15 }} transition={{ duration: 0.08, ease: 'easeOut' }} className="mr-1">
					<Heart className={cn('h-4 w-4 transition-colors duration-150', isLiked && 'fill-current')} />
				</motion.div>

				{/* 点赞数量 - 优化动画性能 */}
				<AnimatePresence mode="wait">
					<motion.span
						key={likeCount}
						initial={{ opacity: 0, y: -5 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 5 }}
						transition={{ duration: 0.12, ease: 'easeOut' }}
						className="text-xs min-w-[20px] text-left"
					>
						{formattedLikeCount}
					</motion.span>
				</AnimatePresence>
			</Button>

			{/* 评论输入popover */}
			<CommentInputPopup postId={postId} onAddComment={onAddComment} replyTo={replyTo}>
				<Button variant="ghost" size="sm" className="h-8 px-2">
					<MessageCircle className="h-4 w-4 mr-1" />
					<span className="text-xs">{feedUtil.formatCount(commentCount)}</span>
				</Button>
			</CommentInputPopup>

			{/* 分享按钮 */}
			<Button variant="ghost" size="sm" className="h-8 px-2 min-w-[40px] justify-center text-muted-foreground hover:text-green-500 transition-colors" onClick={handleShare}>
				<Share className="h-4 w-4" />
			</Button>
		</div>
	)
}

export interface FeedItemActionsProps {
	postId: string
	likeCount: number
	commentCount: number
	isLiked: boolean
	onLike: (postId: string) => void
	onAddComment: (content: string, replyTo?: string) => void
	replyTo?: string
	className?: string
}