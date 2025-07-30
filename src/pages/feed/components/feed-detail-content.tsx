import { type CSSProperties } from 'react'
import { FixedSizeList as List } from 'react-window'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { FeedHeader } from './feed-header'
import { FeedContent } from './feed-content'
import { FeedImage } from './feed-image'
import { FeedActions } from './feed-actions'
import { CommentItem } from './comment-item'
import { useFeedDetail } from '../hooks/use-feed-detail'
import { type FeedPost, type Comment } from '../feed-store'
import { feedConfig } from '../feed-config'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ExternalLink, RefreshCw } from 'lucide-react'

/**
 * Feed详情内容组件 - 弹窗和详情页共用
 */
export const FeedDetailContent = (props: FeedDetailContentProps) => {
	const { post, showNavigateButton = false, onNavigateToPage, onAddComment, onLikeComment, onReply, className } = props

	// 使用自定义Hook处理详情逻辑
	const {
		comments,
		hasMoreComments,
		handleLike,
		handleToggleExpand,
		handleLoadMore,
		handleRetry,
		loading,
		error
	} = useFeedDetail(post)

	// 处理添加评论
	const handleAddComment = (content: string, replyTo?: string) => onAddComment?.(post.id, content, replyTo)

	// 处理评论点赞
	const handleLikeComment = (commentId: string) => onLikeComment?.(commentId)

	// 处理回复
	const handleReply = (username: string) => onReply?.(post.id, username)

	// 跳转到详情页
	const handleNavigateToPage = () => onNavigateToPage?.(post.id)

	// 错误状态
	if (error && comments.length === 0) {
		return (
			<div className={cn('flex flex-col h-full items-center justify-center', className)}>
				<div className="text-center">
					<p className="text-destructive mb-4">加载评论失败</p>
					<Button onClick={handleRetry} size="sm">重试</Button>
				</div>
			</div>
		)
	}

	return (
		<div className={cn('flex flex-col h-full', className)} data-slot="feed-detail-content">
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
				/>

				{/* 文字内容 */}
				{post.content && (
					<FeedContent 
						content={post.content} 
						isExpanded={post.isExpanded} 
						onToggleExpand={() => handleToggleExpand(post.id)} 
						className="mb-4" 
					/>
				)}

				{/* 图片内容 */}
				{post.image && (
					<FeedImage 
						src={post.image} 
						alt={`${post.username}的图片`} 
						className="mb-4" 
					/>
				)}

				{/* 交互按钮 */}
				<div className="flex items-center justify-between">
					<FeedActions
						postId={post.id}
						likeCount={post.likeCount}
						commentCount={post.commentCount}
						isLiked={post.isLiked}
						onLike={handleLike}
						onAddComment={handleAddComment}
					/>

					{/* 跳转按钮 */}
					{showNavigateButton && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleNavigateToPage}
							className="ml-4"
						>
							<ExternalLink className="w-4 h-4 mr-2" />
							新页面打开
						</Button>
					)}
				</div>
			</div>

			{/* 评论区域 */}
			<div className="flex-1 flex flex-col min-h-0">
				{/* 评论列表 */}
				<div className="flex-1 min-h-0">
					{loading && comments.length === 0 ? (
						// 首次加载骨架屏
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
					) : comments.length > 0 ? (
						<VirtualCommentList
							comments={comments}
							onReply={handleReply}
							onLikeComment={handleLikeComment}
							hasMore={hasMoreComments}
							loading={loading}
							error={error}
							onLoadMore={handleLoadMore}
							onRetry={handleRetry}
						/>
					) : (
						// 无评论状态
						<div className="flex-1 flex items-center justify-center text-muted-foreground">
							<div className="text-center">
								<p className="text-sm">暂无评论</p>
								<p className="text-xs mt-1">来发表第一条评论吧</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

/**
 * 虚拟滚动评论列表组件
 */
const VirtualCommentList = (props: VirtualCommentListProps) => {
	const { comments, onReply, onLikeComment, hasMore, loading, error, onLoadMore, onRetry } = props

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
						<div className="text-center text-sm text-muted-foreground">
							没有更多评论了
						</div>
					)}
				</div>
			)
		}

		if (!comment) return null

		return (
			<div style={style} className="px-6 py-2" data-slot="comment-item-renderer">
				<CommentItem 
					comment={comment} 
					onReply={onReply} 
					onLike={onLikeComment} 
				/>
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
			}} data-slot="virtual-comment-list"
		>
			{CommentItemRenderer}
		</List>
	)
}

export interface FeedDetailContentProps {
	post: FeedPost
	showNavigateButton?: boolean // 是否显示跳转按钮
	onNavigateToPage?: (postId: string) => void
	onAddComment?: (postId: string, content: string, replyTo?: string) => void
	onLikeComment?: (commentId: string) => void
	onReply?: (postId: string, username: string) => void
	className?: string
}

interface VirtualCommentListProps {
	comments: Comment[]
	onReply: (username: string) => void
	onLikeComment: (commentId: string) => void
	hasMore: boolean
	loading: boolean
	error?: string
	onLoadMore: () => void
	onRetry: () => void
}
