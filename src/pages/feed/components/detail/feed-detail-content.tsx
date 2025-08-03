import { useMemo, useEffect } from 'react'
import { FeedItemHeader } from '../item/feed-item-header'
import { FeedText } from '../feed-text'
import { FeedItemImage } from '../item/feed-item-image'
import { FeedItemActions } from '../item/feed-item-actions'
import { FeedDetailCommentList } from './feed-detail-comment-list'
import { FeedSkeleton } from '../feed-skeleton'
import { useFeedDetailStore } from '../../feed-detail-store'
import { useFeedStore } from '../../feed-store'
import { feedDetailMgr } from '../../core/feed-detail-mgr'
import { type AppFeedPost } from '../../feed-types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FileX, WifiOff } from 'lucide-react'

/**
 * Feed详情内容组件 - 弹窗和详情页共用
 */
export const FeedDetailContent = (props: FeedDetailContentProps) => {
	const { postId, showNavigateButton = false, onNavigateToPage, className } = props

	const { currPost, comments, commentsHasMore, commentsLoading = false, commentsError, loading, error } = useFeedDetailStore()
	const { posts } = useFeedStore()

	// 数据加载逻辑
	useEffect(() => {
		if (!postId) return

		const loadData = async () => {
			// 检查 feedStore 中是否有缓存
			const cachedPost = posts.find((p) => p.id === postId)
			if (cachedPost && currPost?.id !== postId) {
				// 有缓存且不是当前显示的 post，直接使用缓存并初始化评论
				const detailStore = useFeedDetailStore.getState()
				detailStore.setCurrPost(cachedPost)
				await feedDetailMgr.initComments(postId, cachedPost)
			} else if (!currPost || currPost.id !== postId) {
				// 没有缓存或不是当前 post，加载完整数据
				await feedDetailMgr.loadPostData(postId)
			}
		}

		loadData()
	}, [postId])

	// 处理函数
	const handleNavigateToPage = () => {
		const targetPostId = currPost?.id || postId
		if (targetPostId) onNavigateToPage?.(targetPostId)
	}

	// 加载更多评论
	const handleLoadMore = async () => {
		if (commentsLoading) return
		await feedDetailMgr.loadMoreComments()
	}

	// 重试加载
	const handleRetry = () => {
		if (postId) {
			feedDetailMgr.loadPostData(postId)
		} else {
			handleLoadMore()
		}
	}

	// 渲染不同状态
	const renderLoading = () => (
		<div className={cn('p-6', className)} data-slot="feed-detail-content-loading">
			<FeedSkeleton count={1} />
		</div>
	)

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
			<div className="text-center space-y-4">
				<WifiOff className="w-16 h-16 mx-auto text-muted-foreground/40" />
				<div className="space-y-2">
					<p className="text-destructive font-medium">加载失败</p>
					<p className="text-sm text-muted-foreground">{error || '网络错误，请重试'}</p>
				</div>
				<Button onClick={handleRetry} size="sm">
					重试
				</Button>
			</div>
		</div>
	)

	const renderCommentError = () => (
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
		return <FeedDetailCommentList comments={comments} hasMore={commentsHasMore} loading={commentsLoading} error={commentsError} onLoadMore={handleLoadMore} onRetry={handleRetry} />
	}

	// 主要状态判断
	if (loading && !currPost) return renderLoading() // 加载中且没有数据时显示骨架图
	if (error && !currPost) return renderError() // 加载错误且没有数据时显示错误
	if (!currPost) return renderEmptyPost() // 没有 post 数据时显示空状态
	if (commentsError && comments.length === 0) return renderCommentError() // 评论加载错误且没有评论时显示错误

	// 解构 post 的常用属性
	const { id, user_id, username, avatar, status, created_at, content, image_url, like_count, comment_count, is_liked, isExpanded } = currPost

	return (
		<div className={cn('flex flex-col', className)} data-slot="feed-detail-content">
			{/* 帖子内容区域 */}
			<div className="flex-shrink-0 p-6 border-b">
				{/* 用户信息 */}
				<FeedItemHeader
					postId={id}
					userId={user_id}
					username={username}
					avatar={avatar}
					status={status}
					createdAt={created_at}
					className="mb-4"
					showNavigateButton={showNavigateButton}
					onNavigateToPage={handleNavigateToPage}
				/>

				{/* 文字内容 */}
				{content && <FeedText postId={id} content={content} isExpanded={isExpanded} className="mb-4" />}

				{/* 图片内容 */}
				{image_url && <FeedItemImage src={image_url} className="mb-4 mx-auto" />}

				{/* 交互按钮 */}
				<FeedItemActions postId={id} likeCount={like_count} commentCount={comment_count} isLiked={is_liked} />
			</div>

			{/* 评论区域 - 自适应剩余空间 */}
			{/* flex-1 允许压缩区域，但是不允许挤压内容的固有区域，min-h-0 可以打破限制 */}
			<div className="flex-1 min-h-0">{renderCommentList()}</div>
		</div>
	)
}

export interface FeedDetailContentProps {
	postId?: string // postId，用于自动加载数据
	showNavigateButton?: boolean // 是否显示跳转按钮
	onNavigateToPage?: (postId: string) => void
	className?: string
}
