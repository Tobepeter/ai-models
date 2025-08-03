import { useMemo } from 'react'
import { FeedItemHeader } from '../item/feed-item-header'
import { FeedText } from '../feed-text'
import { FeedItemImage } from '../item/feed-item-image'
import { FeedItemActions } from '../item/feed-item-actions'
import { FeedDetailCommentList } from './feed-detail-comment-list'
import { useFeedDetailStore } from '../../feed-detail-store'
import { feedDetailMgr } from '../../core/feed-detail-mgr'
import { type AppFeedPost } from '../../feed-types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FileX } from 'lucide-react'

/**
 * Feed详情内容组件 - 弹窗和详情页共用
 */
export const FeedDetailContent = (props: FeedDetailContentProps) => {
	const { post, showNavigateButton = false, onNavigateToPage, className } = props

	const { comments, commentsHasMore, commentsLoading = false, commentsError } = useFeedDetailStore()

	// 处理函数
	const handleNavigateToPage = () => onNavigateToPage?.(post!.id)

	// 加载更多评论
	const handleLoadMore = async () => {
		if (commentsLoading) return
		await feedDetailMgr.loadMoreComments()
	}

	// 重试加载
	const handleRetry = () => handleLoadMore()

	// 切换点赞
	const handleToggleLike = () => {
		feedDetailMgr.toggleLike()
	}

	// 切换展开
	const handleToggleExpand = () => {
		if (post?.id) {
			// 这里可以在详情页状态中管理展开状态，或者调用原有的feed store
			// 为了简单起见，暂时保持原有逻辑
			console.log('切换展开状态:', post.id)
		}
	}

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
		return <FeedDetailCommentList comments={comments} hasMore={commentsHasMore} loading={commentsLoading} error={commentsError} onLoadMore={handleLoadMore} onRetry={handleRetry} />
	}

	// 主要状态判断
	if (!post) return renderEmptyPost()
	if (commentsError && comments.length === 0) return renderError()

	// 解构 post 的常用属性
	const { id, user_id, username, avatar, status, created_at, content, image_url, like_count, comment_count, is_liked, is_expanded } = post

	return (
		<div className={cn('flex flex-col', className)} data-slot="feed-detail-content">
			{/* 帖子内容区域 */}
			<div className="flex-shrink-0 p-6 border-b">
				{/* 用户信息 */}
				<FeedItemHeader
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
				{content && <FeedText postId={id} content={content} isExpanded={is_expanded} className="mb-4" />}

				{/* 图片内容 */}
				{image_url && <FeedItemImage src={image_url} className="mb-4 mx-auto" />}

				{/* 交互按钮 */}
				<FeedItemActions 
					postId={id} 
					likeCount={like_count} 
					commentCount={comment_count} 
					isLiked={is_liked}
				/>
			</div>

			{/* 评论区域 - 自适应剩余空间 */}
			{/* flex-1 允许压缩区域，但是不允许挤压内容的固有区域，min-h-0 可以打破限制 */}
			<div className="flex-1 min-h-0">{renderCommentList()}</div>
		</div>
	)
}

export interface FeedDetailContentProps {
	post: AppFeedPost | null // 支持 null，用于显示帖子不存在状态
	showNavigateButton?: boolean // 是否显示跳转按钮
	onNavigateToPage?: (postId: string) => void
	className?: string
}
