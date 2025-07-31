import { UserAvatar } from '@/components/common/user-avatar'
import { type FeedComment } from '../feed-types'
import { feedUtil } from '../feed-util'
import { cn } from '@/lib/utils'
import { CommentInputPopup } from './feed-comment-input-popup'
import { useState } from 'react'

/**
 * 单条评论组件 - 紧凑布局，显示用户名
 */
export const FeedCommentItem = (props: FeedCommentItemProps) => {
	const { comment, onReply, onAddComment, className } = props
	const [replyTo, setReplyTo] = useState<string | undefined>()

	const handleReply = () => {
		setReplyTo(comment.username)
		onReply?.(comment.username)
	}

	const handleClearReply = () => setReplyTo(undefined)

	const handleAddComment = (content: string, replyTo?: string) => {
		onAddComment?.(content, replyTo)
		setReplyTo(undefined)
	}

	return (
		<div className={cn('flex space-x-3 py-2 transition-colors hover:bg-muted/30 rounded-lg', className)} data-slot="comment-item">
			{/* 用户头像 */}
			<UserAvatar src={comment.avatar} alt={`${comment.username}的头像`} size={28} className="flex-shrink-0 mt-0.5" fallbackText={comment.username.charAt(0)} />

			{/* 评论内容 */}
			<div className="flex-1 min-w-0">
				<div className="text-sm text-foreground leading-relaxed">
					{comment.replyTo && <span className="text-primary mr-1">@{comment.replyTo} </span>}
					<CommentInputPopup postId={comment.postId} onAddComment={handleAddComment} replyTo={replyTo} onClearReply={handleClearReply}>
						{/* 艾特 */}
						<button onClick={handleReply} className="text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer mr-1">
							@{comment.username}
						</button>
					</CommentInputPopup>
					<span className="break-words">{comment.content}</span>
					<span className="text-xs text-muted-foreground ml-2">({feedUtil.formatTime(comment.createdAt)})</span>
				</div>
			</div>
		</div>
	)
}

export interface FeedCommentItemProps {
	comment: FeedComment
	onReply?: (username: string) => void
	onAddComment?: (content: string, replyTo?: string) => void
	className?: string
}
