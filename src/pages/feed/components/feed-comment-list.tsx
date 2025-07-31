import { cn } from '@/lib/utils'
import { type FeedComment } from '../feed-types'
import { FeedCommentItem } from './feed-comment-item'
import { feedConfig } from '../feed-config'

/**
 * 评论区组件 - 只显示评论列表，不包含输入框
 */
export const FeedCommentList = (props: FeedCommentListProps) => {
	const { postId, comments = [], onViewMore, onAddComment, className } = props

	// 显示评论列表（最多显示配置数量）
	const displayComments = comments.slice(0, feedConfig.maxCommentsDisplay)
	const hasMoreComments = comments.length > feedConfig.maxCommentsDisplay

	// 如果没有评论，不显示任何内容
	if (comments.length === 0) {
		return null
	}

	return (
		<div className={cn('mt-3', className)} data-slot="feed-comment-list">
			{/* 评论列表 */}
			<div className="relative">
				{displayComments.length > 0 && (
					<div className="py-3 space-y-1">
						{displayComments.map((comment) => (
							<FeedCommentItem key={comment.id} comment={comment} onAddComment={onAddComment} />
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
	onAddComment?: (content: string, replyTo?: string) => void
	className?: string
}
