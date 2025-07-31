import { useMemo } from 'react'
import { FeedHeader } from './feed-header'
import { FeedText } from './feed-text'
import { FeedImage } from './feed-image'
import { FeedActions } from './feed-actions'
import { FeedDetailCommentList } from './feed-detail-comment-list'
import { useFeedStore } from '../feed-store'
import { type FeedPost } from '../feed-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FileX } from 'lucide-react'

/**
 * Feed详情内容组件 - 弹窗和详情页共用
 */
export const FeedDetailContent = (props: FeedDetailContentProps) => {
	const { post, showNavigateButton = false, onNavigateToPage, onAddComment, onReply, className } = props

	const { commentsByPostId, toggleLike, toggleExpand } = useFeedStore()

	// 获取评论数据
	const commentPage = post ? commentsByPostId[post.id] : null
	const comments = useMemo(() => {
		if (!post || !commentPage) {
			return post?.comments || []
		}
		return commentPage.comments.map((id) => commentPage.commentsById[id]).filter(Boolean)
	}, [post, commentPage])

	const hasMoreComments = Boolean(commentPage?.nextCursor || (commentPage?.total || 0) > comments.length)
	const loading = commentPage?.loading || false
	const error = commentPage?.error


	// 处理函数
	const handleLike = (postId: string) => toggleLike(postId)
	const handleToggleExpand = (postId: string) => toggleExpand(postId)
	const handleAddComment = (content: string, replyTo?: string) => onAddComment?.(post!.id, content, replyTo)
	const handleReply = (username: string) => onReply?.(post!.id, username)
	const handleNavigateToPage = () => onNavigateToPage?.(post!.id)

	// 加载更多评论
	const handleLoadMore = async () => {
		if (!commentPage || loading) return
		// TODO: 调用 manager 加载更多评论
		console.log('加载更多评论:', post!.id, commentPage.nextCursor)
	}

	// 重试加载
	const handleRetry = () => handleLoadMore()


	// 渲染不同状态
	const renderEmptyPost = () => (
		<div className={cn('flex items-center justify-center flex-1 min-h-[300px] h-[85vh]', className)} data-slot="feed-detail-content-empty">
			<div className="text-center space-y-4">
				<FileX className="w-16 h-16 mx-auto text-muted-foreground/40" />
				<div className="space-y-2">
					<p className="text-muted-foreground font-medium">帖子不存在</p>
					<p className="text-sm text-muted-foreground">该帖子可能已被删除或不存在</p>
				</div>
			</div>
		</div>
	)

	const renderError = () => (
		<div className={cn('flex items-center justify-center', className)}>
			<div className="text-center">
				<p className="text-destructive mb-4">加载评论失败</p>
				<Button onClick={handleRetry} size="sm">
					重试
				</Button>
			</div>
		</div>
	)

	const renderCommentList = () => {
		return (
			<FeedDetailCommentList
				comments={comments}
				hasMore={hasMoreComments}
				loading={loading}
				error={error}
				onReply={handleReply}
				onAddComment={handleAddComment}
				onLoadMore={handleLoadMore}
				onRetry={handleRetry}
			/>
		)
	}

	// 主要状态判断
	if (!post) return renderEmptyPost()
	if (error && comments.length === 0) return renderError()

	return (
		<div className={cn('flex flex-col', className)} data-slot="feed-detail-content">
			{/* 帖子内容区域 */}
			<div className="flex-shrink-0 p-6 border-b">
				{/* 用户信息 */}
				<FeedHeader 
					userId={post.userId} 
					username={post.username} 
					avatar={post.avatar} 
					status={post.status} 
					createdAt={post.createdAt} 
					className="mb-4"
					showNavigateButton={showNavigateButton}
					onNavigateToPage={handleNavigateToPage}
				/>

				{/* 文字内容 */}
				{post.content && <FeedText content={post.content} isExpanded={post.isExpanded} onToggleExpand={() => handleToggleExpand(post.id)} className="mb-4" />}

				{/* 图片内容 */}
				{post.image && <FeedImage src={post.image} className="mb-4 mx-auto" />}

				{/* 交互按钮 */}
				<FeedActions postId={post.id} likeCount={post.likeCount} commentCount={post.commentCount} isLiked={post.isLiked} onLike={handleLike} onAddComment={handleAddComment} />
			</div>

			{/* 评论区域 - 自适应剩余空间 */}
			{/* flex-1 允许压缩区域，但是不允许挤压内容的固有区域，min-h-0 可以打破限制 */}
			<div className="flex-1 min-h-0">{renderCommentList()}</div>
		</div>
	)
}

export interface FeedDetailContentProps {
	post: FeedPost | null // 支持 null，用于显示帖子不存在状态
	showNavigateButton?: boolean // 是否显示跳转按钮
	onNavigateToPage?: (postId: string) => void
	onAddComment?: (postId: string, content: string, replyTo?: string) => void
	onReply?: (postId: string, username: string) => void
	className?: string
}