import { FeedHeader } from './feed-header'
import { FeedContent } from './feed-content'
import { FeedImage } from './feed-image'
import { FeedActions } from './feed-actions'
import { CommentSection } from './feed-comment-list'
import { type FeedPost } from '../feed-store'
import { cn } from '@/lib/utils'

/**
 * 信息流单项组件 - 布局：头像信息 + 文字内容 + 图片 + 交互按钮 + 评论输入区(动态展开) + 评论列表
 */
export const FeedItem = (props: FeedItemProps) => {
	const { post, onLike, onToggleExpand, onAddComment, onLikeComment, onReply, className } = props

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
		console.log('进入post详情页:', post.id) // TODO: 实现详情页跳转
	}

	return (
		<article className={cn('p-4 bg-card', className)}>
			{/* 用户信息栏 */}
			<FeedHeader userId={post.userId} username={post.username} avatar={post.avatar} status={post.status} createdAt={post.createdAt} className="mb-3" />

			{/* 文字内容栏 */}
			{post.content && <FeedContent content={post.content} isExpanded={post.isExpanded} onToggleExpand={handleToggleExpand} className="mb-3" />}

			{/* 图片内容栏 */}
			{post.image && <FeedImage src={post.image} alt={`${post.username}的图片`} className="mb-3" />}

			{/* 交互按钮栏 */}
			<FeedActions
				postId={post.id}
				likeCount={post.likeCount}
				commentCount={post.commentCount}
				isLiked={post.isLiked}
				onLike={onLike}
				onAddComment={handleAddComment}
			/>
			
			{/* 评论列表 */}
			<CommentSection
				postId={post.id}
				comments={post.comments}
				onViewMore={handleViewMore}
				onLikeComment={handleLikeComment}
				onReply={handleReply}
			/>
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
