import { useNavigate } from 'react-router-dom'
import { FeedHeader } from './feed-header'
import { FeedText } from './feed-text'
import { FeedImage } from './feed-image'
import { FeedActions } from './feed-actions'
import { CommentSection } from './feed-comment-list'
import { type FeedPost, useFeedStore } from '../feed-store'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

/**
 * 信息流单项组件 - 布局：头像信息 + 文字内容 + 图片 + 交互按钮 + 评论输入区(动态展开) + 评论列表
 */
export const FeedItem = (props: FeedItemProps) => {
	const { post, onLike, onToggleExpand, onAddComment, onLikeComment, onReply, className } = props
	const { openDetailDialog } = useFeedStore()
	const navigate = useNavigate()
	const isMobile = useIsMobile()

	const handleToggleExpand = () => onToggleExpand(post.id)
	const handleAddComment = (content: string, replyTo?: string) => {
		onAddComment(post.id, content, replyTo)
	}

	const handleLikeComment = (commentId: string) => {
		onLikeComment?.(commentId)
	}

	const handleReply = (username: string) => {
		onReply?.(post.id, username)
	}

	const handleViewMore = () => {
		if (isMobile) {
			// 移动端直接跳转详情页
			navigate(`/feed/${post.id}`)
		} else {
			// PC端打开弹窗
			openDetailDialog(post.id)
		}
	}

	// 点击内容区域打开详情
	const handleContentClick = () => {
		if (isMobile) {
			// 移动端直接跳转详情页
			navigate(`/feed/${post.id}`)
		} else {
			// PC端打开弹窗
			openDetailDialog(post.id)
		}
	}

	return (
		<article className={cn('bg-card', className)} data-slot="feed-item">
			{/* 整个帖子区域都可点击 */}
			<div 
				className="relative rounded-lg border border-transparent cursor-pointer hover:bg-accent/50 hover:shadow-sm transition-all duration-200 hover:border-border/50"
				onClick={handleContentClick}
			>
				{/* 内容区域 */}
				<div className="p-4">
					{/* 用户信息栏 */}
					<FeedHeader userId={post.userId} username={post.username} avatar={post.avatar} status={post.status} createdAt={post.createdAt} className="mb-3" />

					{/* 文字内容栏 */}
					{post.content && <FeedText content={post.content} isExpanded={post.isExpanded} onToggleExpand={handleToggleExpand} className="mb-3" />}

					{/* 图片内容栏 */}
					{post.image && <FeedImage src={post.image} alt={`${post.username}的图片`} className="mb-3" />}
				</div>

				{/* 交互按钮栏 */}
				<div className="px-4 pb-4">
					<FeedActions
						postId={post.id}
						likeCount={post.likeCount}
						commentCount={post.commentCount}
						isLiked={post.isLiked}
						onLike={onLike}
						onAddComment={handleAddComment}
					/>
				</div>
			</div>

			{/* 评论列表 - 独立区域，不触发弹窗 */}
			<div className="px-4">
				<CommentSection
					postId={post.id}
					comments={post.comments}
					onViewMore={handleViewMore}
					onLikeComment={handleLikeComment}
					onReply={handleReply}
				/>
			</div>
		</article>
	)
}

export interface FeedItemProps {
	post: FeedPost
	onLike: (postId: string) => void
	onToggleExpand: (postId: string) => void
	onAddComment: (postId: string, content: string, replyTo?: string) => void
	onLikeComment?: (commentId: string) => void
	onReply?: (postId: string, username: string) => void
	className?: string
}
