import { useNavigate } from 'react-router-dom'
import { memo } from 'react'
import { FeedItemHeader } from './feed-item-header'
import { FeedText } from '../feed-text'
import { FeedItemImage } from './feed-item-image'
import { FeedItemActions } from './feed-item-actions'
import { FeedCommentList } from '../comment/feed-comment-list'
import { useFeedStore } from '../../feed-store'
import { type FeedPost } from '../../feed-types'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

/**
 * 信息流单项组件
 */
export const FeedItem = memo((props: FeedItemProps) => {
	const { post, onLike, onToggleExpand, onAddComment, className } = props
	const { id, user_id, username, avatar, status, created_at, content, isExpanded, image_url, like_count, comment_count, isLiked, comments } = post
	const { openDetailDialog } = useFeedStore()
	const navigate = useNavigate()
	const isMobile = useIsMobile()

	const handleToggleExpand = () => onToggleExpand(id) // 处理展开/收起

	const handleAddComment = (content: string, replyTo?: string) => {
		// 处理添加评论
		onAddComment(id, content, replyTo)
	}

	const handleViewMore = () => {
		// 处理查看更多
		if (isMobile) {
			// 移动端直接跳转详情页
			navigate(`/feed/${id}`)
		} else {
			// PC端打开弹窗
			openDetailDialog(id)
		}
	}

	const handleContentClick = () => {
		// 点击内容区域打开详情
		if (isMobile) {
			navigate(`/feed/${id}`) // 移动端直接跳转详情页
		} else {
			openDetailDialog(id) // PC端打开弹窗
		}
	}

	return (
		<article className={cn('bg-card', className)} data-slot="feed-item">
			{/* 整个帖子区域都可点击 */}
			<div className="relative rounded-lg border border-transparent cursor-pointer hover:bg-accent/50 hover:shadow-sm transition-all duration-200 hover:border-border/50" onClick={handleContentClick}>
				{/* post内容 */}
				<div className="p-4">
					<FeedItemHeader userId={user_id} username={username} avatar={avatar} status={status} createdAt={created_at} className="mb-3" />
					{content && <FeedText content={content} isExpanded={isExpanded} onToggleExpand={handleToggleExpand} className="mb-3" />}
					{image_url && <FeedItemImage src={image_url} className="mb-3" />}
				</div>

				{/* 交互按钮栏 */}
				<div className="px-4 pb-4">
					<FeedItemActions postId={id} likeCount={like_count} commentCount={comment_count} isLiked={isLiked} onLike={onLike} onAddComment={handleAddComment} />
				</div>
			</div>

			{/* 评论列表 - 独立区域，不触发弹窗 */}
			<div className="px-4 pb-4">
				<FeedCommentList postId={id} comments={comments} onViewMore={handleViewMore} onAddComment={onAddComment} />
			</div>
		</article>
	)
})

export interface FeedItemProps {
	post: FeedPost
	onLike: (postId: string) => void
	onToggleExpand: (postId: string) => void
	onAddComment: (postId: string, content: string, replyTo?: string) => void
	className?: string
}
