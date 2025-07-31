import { FeedCommentItem } from './feed-comment-item'
import { type FeedComment } from '../feed-types'
import { cn } from '@/lib/utils'

const MAX_COMMENTS_DISPLAY = 10 // 最多显示10条评论

/**
 * 评论区组件 - 只显示评论列表，不包含输入框
 */
export const FeedCommentList = (props: FeedCommentListProps) => {
	const { postId, comments = [], onViewMore, onReply, onAddComment, className } = props

	// 确保comments是数组
	const safeComments = Array.isArray(comments) ? comments : []

	// 显示the评论列表（最多10条）
	const displayComments = safeComments.slice(0, MAX_COMMENTS_DISPLAY)
	const hasMoreComments = safeComments.length > MAX_COMMENTS_DISPLAY

	// 如果没有评论，不显示任何内容
	if (safeComments.length === 0) {
		return null
	}

	return (
		<div className={cn('mt-3', className)} data-slot="comment-section">
			{/* 评论列表 - 始终可见 */}
			<div className="relative">
				{/* 评论列表 - 直接内嵌 */}
				{displayComments.length > 0 && (
					<div className="py-3 space-y-1" data-slot="comment-list">
						{displayComments.map((comment) => (
							<FeedCommentItem key={comment.id} comment={comment} onReply={onReply} onAddComment={onAddComment} />
						))}
					</div>
				)}

				{/* 更多按钮 */}
				{hasMoreComments && (
					<div className="flex justify-center pb-2">
						<button onClick={onViewMore} className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
							查看更多评论
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export interface FeedCommentListProps {
	postId: string
	comments?: FeedComment[] // 评论列表可能为空
	onViewMore: () => void // 查看更多评论的回调
	onReply?: (username: string) => void
	onAddComment?: (content: string, replyTo?: string) => void
	className?: string
}
