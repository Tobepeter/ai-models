import { UserAvatar } from '@/components/common/user-avatar'
import { type FeedComment } from '../feed-types'
import { feedUtil } from '../feed-util'
import { cn } from '@/lib/utils'
import { CommentInputPopup } from './feed-comment-input-popup'
import { useState } from 'react'

/**
 * 单条评论组件 - 支持点击回复，包含头像和背景hover效果
 */
export const FeedCommentItem = (props: FeedCommentItemProps) => {
	const { comment, onAddComment, className } = props
	const { username, avatar, replyTo: commentReplyTo, postId, content, createdAt } = comment
	const [replyTo, setReplyTo] = useState<string | undefined>()

	const handleAddComment = (content: string, replyTo?: string) => {
		// 处理添加评论
		onAddComment?.(content, replyTo)
		setReplyTo(undefined)
	}

	const handleCommentClick = () => {
		// 如果已经是回复此用户状态，先重置再重设触发重新打开
		if (replyTo === username) {
			setReplyTo(undefined)
			setTimeout(() => setReplyTo(username), 0)
		} else {
			setReplyTo(username)
		}
	}

	return (
		<div
			className={cn('flex space-x-3 py-2 transition-all duration-200 hover:bg-accent/40 hover:shadow-sm rounded-lg cursor-pointer', className)}
			onClick={handleCommentClick}
			data-slot="comment-item"
		>
			{/* 用户头像 - 可点击 */}
			<UserAvatar src={avatar} alt={`${username}的头像`} size={28} className="flex-shrink-0 mt-0.5 hover:ring-2 hover:ring-primary/20 transition-all" fallbackText={username.charAt(0)} />

			{/* 评论内容区域 */}
			<div className="flex-1 min-w-0">
				<div className="text-sm text-foreground leading-relaxed">
					{commentReplyTo && <span className="text-primary mr-1">@{commentReplyTo} </span>}
					<CommentInputPopup postId={postId} onAddComment={handleAddComment} replyTo={replyTo}>
						{/* 用户名按钮 - 阻止事件冒泡 */}
						<button className="text-primary hover:text-primary/80 font-medium transition-colors mr-1" onClick={(e) => e.stopPropagation()}>
							@{username}
						</button>
					</CommentInputPopup>
					<span className="break-words">{content}</span>
					<span className="text-xs text-muted-foreground ml-2">({feedUtil.formatTime(createdAt)})</span>
				</div>
			</div>
		</div>
	)
}

interface FeedCommentItemProps {
	comment: FeedComment
	onAddComment?: (content: string, replyTo?: string) => void
	className?: string
}

export { type FeedCommentItemProps }
