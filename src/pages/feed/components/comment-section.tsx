import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CommentInput } from './comment-input'
import { CommentList } from './comment-list'
import { type Comment } from '../feed-store'
import { cn } from '@/lib/utils'

interface CommentSectionProps {
	postId: string
	comments: Comment[]
	isOpen: boolean
	onAddComment: (content: string, replyTo?: string) => void
	onLikeComment?: (commentId: string) => void
	className?: string
}

/* 评论区组件 - 包含评论输入框和评论列表，支持展开收起动画 */
export const CommentSection = (props: CommentSectionProps) => {
	const { postId, comments, isOpen, onAddComment, onLikeComment, className } = props
	const [replyTo, setReplyTo] = useState<string | undefined>()

	const handleAddComment = async (content: string, replyToUser?: string) => {
		await onAddComment(content, replyToUser)
		setReplyTo(undefined) // 清除回复状态
	}

	const handleReply = (username: string) => setReplyTo(username)
	const handleCancelReply = () => setReplyTo(undefined)

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ height: 0, opacity: 0 }}
					animate={{ height: 'auto', opacity: 1 }}
					exit={{ height: 0, opacity: 0 }}
					transition={{ duration: 0.3, ease: 'easeInOut' }}
					className={cn('overflow-hidden bg-card border-t border-border', className)}
				>
					<div className="max-h-[400px] overflow-y-auto">
						<CommentInput postId={postId} replyTo={replyTo} onSubmit={handleAddComment} onCancel={replyTo ? handleCancelReply : undefined} />

						<CommentList comments={comments} onReply={handleReply} onLikeComment={onLikeComment} />
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
