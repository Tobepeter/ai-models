import { useEffect, useRef } from 'react'
import { useInViewport, useMount } from 'ahooks'
import { useFeedStore } from './feed-store'
import { feedMgr } from './feed-mgr'
import { FeedItem } from './components/feed-item'
import { FeedSkeleton, LoadMoreSkeleton } from './components/feed-skeleton'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

/* 信息流主页面 - 支持无限滚动和下拉刷新 */
export const Feed = () => {
	const props = useFeedStore()
	const { posts, loading, refreshing, hasMore, error, clearError } = props

	const loadMoreRef = useRef<HTMLDivElement>(null) // 触底检测元素引用
	const [loadMoreInViewport] = useInViewport(loadMoreRef) // 是否进入视口

	// 初始化数据加载
	useMount(() => {
		feedMgr.loadInitial()
	})

	// 滚动到底部时自动加载更多
	useEffect(() => {
		if (loadMoreInViewport && hasMore && !loading && !refreshing) feedMgr.loadMore()
	}, [loadMoreInViewport, hasMore, loading, refreshing])

	const handleRefresh = async () => {
		clearError()
		await feedMgr.refresh()
	}

	const handleLike = (postId: string) => feedMgr.toggleLike(postId)
	const handleToggleExpand = (postId: string) => feedMgr.toggleExpand(postId)
	const handleToggleComments = (postId: string) => feedMgr.toggleComments(postId)
	const handleAddComment = (postId: string, content: string, replyTo?: string) => {
		feedMgr.addComment(postId, content, replyTo)
	}

	const handleRetry = () => {
		clearError()
		if (posts.length === 0) {
			feedMgr.loadInitial()
		} else {
			feedMgr.loadMore()
		}
	}

	return (
		<div className="max-w-2xl mx-auto min-h-screen bg-background">
			{/* 固定顶部栏 - 标题和刷新按钮 */}
			<div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border p-4">
				<div className="flex items-center justify-between">
					<h1 className="text-lg font-semibold">信息流</h1>
					<Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing || loading} className="h-8 w-8 p-0">
						<RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
					</Button>
				</div>
			</div>

			{/* 主要内容区域 */}
			<div className="pb-20">
				{/* 错误提示条 */}
				{error && (
					<div className="p-4 m-4 bg-destructive/10 border border-destructive/20 rounded-lg">
						<div className="flex items-center space-x-2 text-destructive">
							<AlertCircle className="h-4 w-4" />
							<span className="text-sm">{error}</span>
						</div>
						<Button variant="outline" size="sm" onClick={handleRetry} className="mt-2">
							重试
						</Button>
					</div>
				)}

				{/* 帖子列表 */}
				{posts.length > 0 && (
					<div className="divide-y divide-border">
						{posts.map((post) => (
							<FeedItem key={post.id} post={post} onLike={handleLike} onToggleExpand={handleToggleExpand} onToggleComments={handleToggleComments} onAddComment={handleAddComment} />
						))}
					</div>
				)}

				{/* 首次加载骨架屏 */}
				{posts.length === 0 && loading && !error && <FeedSkeleton count={5} />}

				{/* 底部加载区域 - 用于触发无限滚动 */}
				{posts.length > 0 && (
					<div ref={loadMoreRef} className="py-4">
						{loading && hasMore && <LoadMoreSkeleton />}
						{!hasMore && <div className="text-center text-muted-foreground text-sm py-8">没有更多内容了</div>}
					</div>
				)}

				{/* 空状态展示 */}
				{posts.length === 0 && !loading && !error && (
					<div className="text-center py-20">
						<div className="text-muted-foreground text-sm mb-4">暂无内容</div>
						<Button variant="outline" size="sm" onClick={() => feedMgr.loadInitial()}>
							刷新试试
						</Button>
					</div>
				)}
			</div>
		</div>
	)
}
