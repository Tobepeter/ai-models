import { CommentItem } from './comment-item'
import { type Comment } from '../feed-store'
import { cn } from '@/lib/utils'

interface CommentListProps {
	comments?: Comment[]
	onReply: (username: string) => void
	onLikeComment?: (commentId: string) => void
	className?: string
}

/**
 * 评论列表组件
 * 显示所有评论，按时间排序
 */
export const CommentList = (props: CommentListProps) => {
	const { comments, onReply, onLikeComment, className } = props

	if (!comments || comments.length === 0) {
		return <div className={cn('py-4 text-center text-muted-foreground text-sm', className)}>暂无评论</div>
	}

	return (
		<div className={cn('py-3 space-y-1', className)}>
			{comments?.map((comment) => (
				<CommentItem key={comment.id} comment={comment} onReply={onReply} onLike={onLikeComment} />
			))}
		</div>
	)
}
