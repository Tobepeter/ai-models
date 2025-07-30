import { UserAvatar } from '@/components/common/user-avatar'
import { type Comment } from '../feed-store'
import { feedUtil } from '../feed-util'
import { cn } from '@/lib/utils'

/**
 * 单条评论组件 - 紧凑布局，显示用户名
 */
export const CommentItem = (props: CommentItemProps) => {
	const { comment, className } = props

	return (
		<div className={cn('flex space-x-3 py-2', className)} data-slot="comment-item">
			{/* 用户头像 */}
			<UserAvatar
				src={comment.avatar}
				alt={`${comment.username}的头像`}
				size={28}
				className="flex-shrink-0 mt-0.5"
				fallbackText={comment.username.charAt(0)}
			/>

			{/* 评论内容 */}
			<div className="flex-1 min-w-0">
				<div className="text-sm text-foreground leading-relaxed">
					{comment.replyTo && <span className="text-primary mr-1">@{comment.replyTo} </span>}
					<span className="break-words">{comment.content}</span>
					<span className="text-xs text-muted-foreground ml-2">({feedUtil.formatTime(comment.createdAt)})</span>
				</div>
			</div>
		</div>
	)
}

export interface CommentItemProps {
	comment: Comment
	onReply: (username: string) => void
	onLike?: (commentId: string) => void
	className?: string
}
