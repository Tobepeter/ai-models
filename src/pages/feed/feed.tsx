import { useMount, useUnmount } from 'ahooks'
import { useEffect, useCallback } from 'react'
import { useFeedStore } from './feed-store'
import { feedMgr } from './feed-mgr'
import { FeedList } from './components/feed-list'
import { FeedSkeleton } from './components/feed-skeleton'
import { FeedDetailDialog } from './components/detail/feed-detail-dialog'
import { FeedCreateDialog } from './components/feed-create-dialog'
import { FeedNavHeader } from './components/feed-nav-header'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { useHeader } from '@/hooks/use-header'

/* 信息流主页面 - 支持无限滚动和下拉刷新 */
export const Feed = () => {
	const { posts, loading, hasMore, error, clearError } = useFeedStore()
	const { setTitle } = useHeader() // 使用hook，自动处理unmount reset

	// 初始化数据加载和header设置
	useMount(() => {
		feedMgr.loadInitial()
		setTitle(<FeedNavHeader />)
	})

	useUnmount(() => {
		useFeedStore.getState().reset()
	})

	const handleLike = useCallback((postId: string) => feedMgr.toggleLike(postId), [])
	const handleToggleExpand = useCallback((postId: string) => feedMgr.toggleExpand(postId), [])
	const handleAddComment = useCallback((postId: string, content: string, replyTo?: string) => {
		// 处理添加评论
		feedMgr.addComment(postId, content, replyTo)
	}, [])

	const handleLoadMore = useCallback(() => feedMgr.loadMore(), [])

	const handleRetry = () => {
		clearError()
		if (posts.length === 0) {
			feedMgr.loadInitial()
		} else {
			feedMgr.loadMore()
		}
	}

	return (
		<div className="max-w-2xl mx-auto h-screen bg-background flex flex-col" data-slot="feed">
			{/* 错误提示条 */}
			{error && (
				<div className="p-4 m-4 bg-destructive/10 border border-destructive/20 rounded-lg flex-shrink-0">
					<div className="flex items-center space-x-2 text-destructive">
						<AlertCircle className="h-4 w-4" />
						<span className="text-sm">{error}</span>
					</div>
					<Button variant="outline" size="sm" onClick={handleRetry} className="mt-2">
						重试
					</Button>
				</div>
			)}

			{/* 主要内容区域 - 使用 flex-1 占满剩余空间 */}
			{posts.length > 0 ? (
				<FeedList posts={posts} loading={loading} hasMore={hasMore} onLike={handleLike} onToggleExpand={handleToggleExpand} onAddComment={handleAddComment} onLoadMore={handleLoadMore} />
			) : (
				<div className="flex-1 flex items-center justify-center">
					{loading && !error ? (
						<FeedSkeleton count={5} />
					) : (
						!error && (
							<div className="text-center">
								<div className="text-muted-foreground text-sm mb-4">暂无内容</div>
								<Button variant="outline" size="sm" onClick={() => feedMgr.loadInitial()}>
									刷新试试
								</Button>
							</div>
						)
					)}
				</div>
			)}

			{/* 详情弹窗 */}
			<FeedDetailDialog />

			{/* 创建弹窗 */}
			<FeedCreateDialog />
		</div>
	)
}
