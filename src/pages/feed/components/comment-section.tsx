import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CommentInput } from './comment-input'
import { CommentList } from './comment-list'
import { type Comment } from '../feed-store'
import { cn } from '@/lib/utils'

const MAX_COMMENTS_DISPLAY = 10 // 最多显示10条评论

interface CommentSectionProps {
	postId: string
	comments?: Comment[] // 评论列表可能为空
	showCommentInput: boolean // 是否显示评论输入框
	onAddComment: (content: string, replyTo?: string) => void
	onViewMore: () => void // 查看更多评论的回调
	onLikeComment?: (commentId: string) => void
	className?: string
}

/* 评论区组件 - 包含动态展开的评论输入框和始终可见的评论列表 */
export const CommentSection = (props: CommentSectionProps) => {
	const { postId, comments = [], showCommentInput, onAddComment, onViewMore, onLikeComment, className } = props
	const [replyTo, setReplyTo] = useState<string | undefined>()

	const handleAddComment = async (content: string, replyToUser?: string) => {
		await onAddComment(content, replyToUser)
		setReplyTo(undefined) // 清除回复状态
	}

	const handleReply = (username: string) => setReplyTo(username)
	const handleCancelReply = () => setReplyTo(undefined)

	// 确保comments是数组
	const safeComments = Array.isArray(comments) ? comments : []

	// 显示的评论列表（最多30条）
	const displayComments = safeComments.slice(0, MAX_COMMENTS_DISPLAY)
	const hasMoreComments = safeComments.length > MAX_COMMENTS_DISPLAY

	return (
		<div className={cn('mt-3', className)}>
			{/* 动态展开的评论输入框 - 抽屉效果 */}
			<AnimatePresence>
				{showCommentInput && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
						className="overflow-hidden bg-muted/30 border border-border rounded-lg mb-3"
					>
						<CommentInput
							postId={postId}
							replyTo={replyTo}
							onSubmit={handleAddComment}
							onCancel={replyTo ? handleCancelReply : undefined}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{/* 评论列表 - 始终可见 */}
			{safeComments.length > 0 && (
				<div className="relative">
					<CommentList comments={displayComments} onReply={handleReply} onLikeComment={onLikeComment} />

					{/* 更多按钮 */}
					{hasMoreComments && (
						<div className="flex justify-center py-2">
							<button
								onClick={onViewMore}
								className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
							>
								查看更多评论
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
