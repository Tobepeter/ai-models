import { UserAvatar } from '@/components/common/user-avatar'
import { UserCardPopup } from '@/components/common/user-card-popup'
import { memo } from 'react'
import { type AppFeedComment } from '../../feed-types'
import { feedUtil } from '../../core/feed-util'
import { cn } from '@/lib/utils'
import { CommentInputPopup } from './feed-comment-input-popup'
import { useFeedStore } from '../../feed-store'

/**
 * 单条评论组件 - 支持点击回复，包含头像和背景hover效果
 */
export const FeedCommentItem = memo((props: FeedCommentItemProps) => {
	const { comment, className } = props
	const { isCommentInputOpen } = useFeedStore()
	const { username, avatar, reply_to: originalReplyTo, post_id, content, created_at } = comment

	// 构造用户卡片需要的数据
	const userData = {
		username: username || '',
		email: `${username}@example.com`, // FeedComment 中没有邮箱字段，使用占位符
		avatar: avatar || '',
		extra: '', // 如果有 user 表的额外信息，可以在这里传入
	}

	// 移除独立的点击处理，统一通过 CommentInputPopup 处理

	return (
		<CommentInputPopup postId={post_id} replyTo={username}>
			<div className={cn('flex space-x-3 py-2 transition-all duration-200 rounded-lg', !isCommentInputOpen && 'hover:bg-accent/40 hover:shadow-sm cursor-pointer', className)} data-slot="comment-item">
				<UserAvatar src={avatar} username={username} size={28} className="flex-shrink-0 mt-0.5 hover:ring-2 hover:ring-primary/20 transition-all" /> {/* 用户头像 */}
				{/* 评论内容区域 */}
				<div className="flex-1 min-w-0">
					{/* 用户名行 */}
					<div className="flex items-center mb-1">
						<UserCardPopup userData={userData}>
							<span className="text-primary font-medium cursor-pointer hover:underline">{username}</span>
						</UserCardPopup>
						<span className="text-xs text-muted-foreground ml-2">({feedUtil.formatTime(created_at)})</span>
					</div>
					{/* 评论内容行 */}
					<div className="text-sm text-foreground leading-relaxed">
						{/* 如有回复，展示艾特用户 */}
						{originalReplyTo && <span className="text-primary mr-1">@{originalReplyTo} </span>}
						<span className="break-words">{content}</span>
					</div>
				</div>
			</div>
		</CommentInputPopup>
	)
})

interface FeedCommentItemProps {
	comment: AppFeedComment
	className?: string
}

export { type FeedCommentItemProps }
