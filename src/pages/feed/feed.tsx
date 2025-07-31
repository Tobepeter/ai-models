import { useMount } from 'ahooks'
import { useFeedStore } from './feed-store'
import { feedMgr } from './feed-mgr'
import { FeedList } from './components/feed-list'
import { FeedSkeleton } from './components/feed-skeleton'
import { FeedDetailDialog } from './components/feed-detail-dialog'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

/* 信息流主页面 - 支持无限滚动和下拉刷新 */
export const Feed = () => {
	const { posts, loading, refreshing, hasMore, error, clearError } = useFeedStore()

	// 初始化数据加载
	useMount(() => {
		feedMgr.loadInitial()
	})


	const handleRefresh = async () => {
		clearError()
		await feedMgr.refresh()
	}

	const handleLike = (postId: string) => feedMgr.toggleLike(postId)
	const handleToggleExpand = (postId: string) => feedMgr.toggleExpand(postId)
	const handleAddComment = (postId: string, content: string, replyTo?: string) => {
		feedMgr.addComment(postId, content, replyTo)
	}
	const handleReply = (postId: string, username: string) => {
		console.log('回复用户:', postId, username) // TODO: 实现回复功能状态管理
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
		<div className="max-w-2xl mx-auto h-screen bg-background flex flex-col" data-slot="feed">
			{/* 固定顶部栏 - 标题和刷新按钮 */}
			<div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border p-4 flex-shrink-0">
				<div className="flex items-center justify-between">
					<h1 className="text-lg font-semibold">信息流</h1>
					<Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loading} className="h-8 w-8 p-0">
						<RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
					</Button>
				</div>
			</div>

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
				<FeedList
					posts={posts}
					loading={loading}
					hasMore={hasMore}
					onLike={handleLike}
					onToggleExpand={handleToggleExpand}
					onAddComment={handleAddComment}
					onReply={handleReply}
					onLoadMore={() => feedMgr.loadMore()}
				/>
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
		</div>
	)
}
