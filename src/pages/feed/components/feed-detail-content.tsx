import { type CSSProperties, useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { FeedHeader } from './feed-header'
import { FeedText } from './feed-text'
import { FeedImage } from './feed-image'
import { FeedActions } from './feed-actions'
import { FeedCommentItem } from './feed-comment-item'
import { useFeedStore } from '../feed-store'
import { type FeedPost, type FeedComment } from '../feed-store'
import { feedConfig } from '../feed-config'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ExternalLink, RefreshCw, FileX } from 'lucide-react'

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
		if (loading && comments.length === 0) {
			// 首次加载骨架屏
			return (
				<div className="p-6 space-y-4">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className="flex space-x-3">
							<Skeleton circle width={32} height={32} />
							<div className="flex-1">
								<Skeleton width="30%" height={16} className="mb-2" />
								<Skeleton count={2} height={14} />
							</div>
						</div>
					))}
				</div>
			)
		}

		if (comments.length > 0) {
			return (
				<VirtualCommentList
					comments={comments}
					onReply={handleReply}
					onAddComment={handleAddComment}
						hasMore={hasMoreComments}
					loading={loading}
					error={error}
					onLoadMore={handleLoadMore}
					onRetry={handleRetry}
				/>
			)
		}

		// 无评论状态
		return (
			<div className="flex-1 flex items-center justify-center text-muted-foreground">
				<div className="text-center">
					<p className="text-sm">暂无评论</p>
					<p className="text-xs mt-1">来发表第一条评论吧</p>
				</div>
			</div>
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
				{post.image && <FeedImage src={post.image} className="mb-4" />}

				{/* 交互按钮 */}
				<FeedActions postId={post.id} likeCount={post.likeCount} commentCount={post.commentCount} isLiked={post.isLiked} onLike={handleLike} onAddComment={handleAddComment} />
			</div>

			{/* 评论区域 - 自适应剩余空间 */}
			<div className="flex-1 min-h-0">{renderCommentList()}</div>
		</div>
	)
}

/**
 * 虚拟滚动评论列表组件
 */
const VirtualCommentList = (props: VirtualCommentListProps) => {
	const { comments, onReply, onAddComment, hasMore, loading, error, onLoadMore, onRetry } = props

	// 评论项渲染器
	const CommentItemRenderer = (props: { index: number; style: CSSProperties }) => {
		const { index, style } = props
		const comment = comments[index]

		// 最后一项显示加载状态
		if (index === comments.length) {
			return (
				<div style={style} className="px-6 py-4">
					{loading ? (
						<div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
							<RefreshCw className="w-4 h-4 animate-spin" />
							<span>正在加载...</span>
						</div>
					) : error ? (
						<div className="flex items-center justify-center space-x-2">
							<span className="text-sm text-destructive">加载失败</span>
							<Button variant="ghost" size="sm" onClick={onRetry}>
								<RefreshCw className="w-4 h-4" />
							</Button>
						</div>
					) : hasMore ? (
						<div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
							<RefreshCw className="w-4 h-4 animate-spin" />
							<span>滚动加载更多...</span>
						</div>
					) : (
						<div className="text-center text-sm text-muted-foreground">没有更多评论了</div>
					)}
				</div>
			)
		}

		if (!comment) return null

		return (
			<div style={style} className="px-6" data-slot="comment-item-renderer">
				<FeedCommentItem comment={comment} onReply={onReply} onAddComment={onAddComment} />
			</div>
		)
	}

	// 计算列表项数量（评论 + 加载更多项）
	const itemCount = comments.length + (hasMore || loading || error ? 1 : 0)

	return (
		<List
			height={feedConfig.virtualScrollHeight}
			width="100%"
			itemCount={itemCount}
			itemSize={feedConfig.commentItemHeight}
			className="w-full"
			onScroll={({ scrollOffset, scrollUpdateWasRequested }) => {
				// 自动加载：当滚动到接近底部时触发加载
				if (!scrollUpdateWasRequested && hasMore && !loading) {
					const totalHeight = itemCount * feedConfig.commentItemHeight
					const visibleHeight = feedConfig.virtualScrollHeight
					const scrollBottom = scrollOffset + visibleHeight
					const loadTriggerPoint = totalHeight - feedConfig.commentAutoLoadDistance

					if (scrollBottom >= loadTriggerPoint) {
						onLoadMore()
					}
				}
			}}
			data-slot="virtual-comment-list"
		>
			{CommentItemRenderer}
		</List>
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

interface VirtualCommentListProps {
	comments: FeedComment[]
	onReply: (username: string) => void
	onAddComment: (content: string, replyTo?: string) => void
	hasMore: boolean
	loading: boolean
	error?: string
	onLoadMore: () => void
	onRetry: () => void
}
