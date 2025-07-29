import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { feedUtil } from '../feed-util'
import { cn } from '@/lib/utils'

interface FeedActionsProps {
	postId: string
	likeCount: number
	commentCount: number
	isLiked: boolean
	showComments: boolean
	onLike: (postId: string) => void
	onComment: (postId: string) => void
	className?: string
}

/* 信息流交互按钮组件 - 包含点赞、评论、分享功能 */
export const FeedActions = (props: FeedActionsProps) => {
	const { postId, likeCount, commentCount, isLiked, showComments, onLike, onComment, className } = props

	const handleLike = (e: React.MouseEvent) => {
		e.stopPropagation()
		onLike(postId)
	}

	const handleComment = (e: React.MouseEvent) => {
		e.stopPropagation()
		onComment(postId)
	}

	const handleShare = (e: React.MouseEvent) => {
		e.stopPropagation()
		console.log('分享:', postId) // TODO: 实现分享功能
	}

	return (
		<div className={cn('flex items-center space-x-4 pt-2', className)}>
			{/* 点赞 */}
			<Button
				variant="ghost"
				size="sm"
				className={cn('h-8 px-2 min-w-[60px] justify-start transition-colors', isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500')}
				onClick={handleLike}
			>
				{/* 点赞爱心 */}
				<motion.div whileTap={{ scale: 1.2 }} transition={{ duration: 0.1 }} className="mr-1">
					<Heart className={cn('h-4 w-4 transition-colors', isLiked && 'fill-current')} />
				</motion.div>

				{/* 点赞数量 */}
				<AnimatePresence mode="wait">
					<motion.span
						key={likeCount}
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						transition={{ duration: 0.2 }}
						className="text-xs min-w-[20px] text-left"
					>
						{feedUtil.formatCount(likeCount)}
					</motion.span>
				</AnimatePresence>
			</Button>

			{/* 评论按钮 */}
			<Button
				variant="ghost"
				size="sm"
				className={cn('h-8 px-2 min-w-[60px] justify-start transition-colors', showComments ? 'text-blue-500 hover:text-blue-600' : 'text-muted-foreground hover:text-blue-500')}
				onClick={handleComment}
			>
				<MessageCircle className="h-4 w-4 mr-1" />
				<span className="text-xs min-w-[20px] text-left">{feedUtil.formatCount(commentCount)}</span>
			</Button>

			{/* 分享按钮 */}
			<Button variant="ghost" size="sm" className="h-8 px-2 min-w-[40px] justify-center text-muted-foreground hover:text-green-500 transition-colors" onClick={handleShare}>
				<Share className="h-4 w-4" />
			</Button>
		</div>
	)
}
