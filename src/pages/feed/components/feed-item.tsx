import { useNavigate } from 'react-router-dom'
import { FeedHeader } from './feed-header'
import { FeedText } from './feed-text'
import { FeedImage } from './feed-image'
import { FeedActions } from './feed-actions'
import { FeedCommentList } from './feed-comment-list'
import { useFeedStore } from '../feed-store'
import { type FeedPost } from '../feed-types'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

/**
 * 信息流单项组件
 */
export const FeedItem = (props: FeedItemProps) => {
	const { post, onLike, onToggleExpand, onAddComment, onReply, className } = props
	const { id, userId, username, avatar, status, createdAt, content, isExpanded, image, likeCount, commentCount, isLiked, comments } = post
	const { openDetailDialog } = useFeedStore()
	const navigate = useNavigate()
	const isMobile = useIsMobile()

	const handleToggleExpand = () => onToggleExpand(id)
	const handleAddComment = (content: string, replyTo?: string) => {
		onAddComment(id, content, replyTo)
	}


	const handleReply = (username: string) => {
		onReply?.(id, username)
	}

	const handleViewMore = () => {
		if (isMobile) {
			// 移动端直接跳转详情页
			navigate(`/feed/${id}`)
		} else {
			// PC端打开弹窗
			openDetailDialog(id)
		}
	}

	// 点击内容区域打开详情
	const handleContentClick = () => {
		if (isMobile) {
			// 移动端直接跳转详情页
			navigate(`/feed/${id}`)
		} else {
			// PC端打开弹窗
			openDetailDialog(id)
		}
	}

	return (
		<article className={cn('bg-card', className)} data-slot="feed-item">
			{/* 整个帖子区域都可点击 */}
			<div className="relative rounded-lg border border-transparent cursor-pointer hover:bg-accent/50 hover:shadow-sm transition-all duration-200 hover:border-border/50" onClick={handleContentClick}>
				{/* post内容 */}
				<div className="p-4">
					<FeedHeader userId={userId} username={username} avatar={avatar} status={status} createdAt={createdAt} className="mb-3" />
					{content && <FeedText content={content} isExpanded={isExpanded} onToggleExpand={handleToggleExpand} className="mb-3" />}
					{image && <FeedImage src={image} className="mb-3" />}
				</div>

				{/* 交互按钮栏 */}
				<div className="px-4 pb-4">
					<FeedActions postId={id} likeCount={likeCount} commentCount={commentCount} isLiked={isLiked} onLike={onLike} onAddComment={handleAddComment} />
				</div>
			</div>

			{/* 评论列表 - 独立区域，不触发弹窗 */}
			<div className="px-4 pb-4">
				<FeedCommentList postId={id} comments={comments} onViewMore={handleViewMore} onReply={handleReply} onAddComment={onAddComment} />
			</div>
		</article>
	)
}

export interface FeedItemProps {
	post: FeedPost
	onLike: (postId: string) => void
	onToggleExpand: (postId: string) => void
	onAddComment: (postId: string, content: string, replyTo?: string) => void
	onReply?: (postId: string, username: string) => void
	className?: string
}
