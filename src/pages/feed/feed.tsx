import { useMount, useUnmount } from 'ahooks'
import { useFeedStore } from './feed-store'
import { feedMgr } from './feed-mgr'
import { FeedList } from './components/feed-list'
import { FeedSkeleton } from './components/feed-skeleton'
import { FeedDetailDialog } from './components/detail/feed-detail-dialog'
import { FeedCreateDialog } from './components/feed-create-dialog'
import { FeedNavHeader } from './components/feed-nav-header'
import { WifiOff, RefreshCw } from 'lucide-react'
import { useHeader } from '@/hooks/use-header'
import { Empty } from '@/components/common/empty'

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

	const handleRetry = () => {
		clearError()
		if (posts.length === 0) {
			feedMgr.loadInitial()
		} else {
			feedMgr.loadMore()
		}
	}

	// 错误状态
	if (error) {
		return (
			<Empty
				icon={<WifiOff className="h-16 w-16 text-muted-foreground" />}
				title="加载失败"
				desc={`${error}\n请检查网络连接后重试`}
				buttonText={
					<>
						<RefreshCw className="h-4 w-4 mr-2" />
						重试
					</>
				}
				onClickButton={handleRetry}
			/>
		)
	}

	return (
		<div className="max-w-2xl mx-auto h-full bg-background flex flex-col" data-slot="feed">
			{/* 主要内容区域 */}
			{posts.length > 0 ? (
				<FeedList posts={posts} loading={loading} hasMore={hasMore} />
			) : (
				<div className="flex-1 flex items-center justify-center">
					{loading ? <FeedSkeleton count={5} /> : <Empty title="暂无内容" buttonText="刷新试试" onClickButton={() => feedMgr.loadInitial()} />}
				</div>
			)}

			{/* 详情弹窗 */}
			<FeedDetailDialog />

			{/* 创建弹窗 */}
			<FeedCreateDialog />
		</div>
	)
}
