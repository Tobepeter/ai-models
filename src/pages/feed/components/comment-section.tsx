import { CommentList } from './comment-list'
import { type Comment } from '../feed-store'
import { cn } from '@/lib/utils'

const MAX_COMMENTS_DISPLAY = 10 // 最多显示10条评论

interface CommentSectionProps {
	postId: string
	comments?: Comment[] // 评论列表可能为空
	onViewMore: () => void // 查看更多评论的回调
	onLikeComment?: (commentId: string) => void
	onReply?: (username: string) => void
	className?: string
}

/* 评论区组件 - 只显示评论列表，不包含输入框 */
export const CommentSection = (props: CommentSectionProps) => {
	const { postId, comments = [], onViewMore, onLikeComment, onReply, className } = props

	// 确保comments是数组
	const safeComments = Array.isArray(comments) ? comments : []

	// 显示的评论列表（最多10条）
	const displayComments = safeComments.slice(0, MAX_COMMENTS_DISPLAY)
	const hasMoreComments = safeComments.length > MAX_COMMENTS_DISPLAY

	// 如果没有评论，不显示任何内容
	if (safeComments.length === 0) {
		return null
	}

	return (
		<div className={cn('mt-3', className)}>
			{/* 评论列表 - 始终可见 */}
			<div className="relative">
				<CommentList comments={displayComments} onReply={onReply} onLikeComment={onLikeComment} />

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
		</div>
	)
}