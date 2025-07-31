import { useEffect, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { FeedItem } from './item/feed-item'
import { FeedSkeleton, LoadMoreSkeleton } from './feed-skeleton'
import { type FeedPost } from '../feed-types'
import { cn } from '@/lib/utils'

/**
 * 虚拟滚动信息流列表组件
 */
export const FeedList = (props: FeedListProps) => {
	const { posts, loading, hasMore, onLike, onToggleExpand, onAddComment, onLoadMore, className } = props

	const parentRef = useRef<HTMLDivElement>(null)

	const postsLength = posts.length // 提取常用计算值
	const estimateSize = 600 // 预估的单个项目高度
	const overscan = 5 // 虚拟滚动的预渲染数量

	// TanStack Virtual 配置
	const virtualizer = useVirtualizer({
		count: postsLength,
		getScrollElement: () => parentRef.current,
		estimateSize: () => estimateSize,
		overscan: overscan,
	})

	// 基于索引判断无限滚动
	useEffect(() => {
		const virtualItems = virtualizer.getVirtualItems()
		if (!virtualItems.length) return

		const lastItem = virtualItems[virtualItems.length - 1]
		// 当最后可见项接近数据末尾时触发加载
		if (lastItem && lastItem.index >= postsLength - 3 && hasMore && !loading) {
			onLoadMore()
		}
	}, [virtualizer.getVirtualItems(), postsLength, hasMore, loading, onLoadMore])

	// 如果没有数据，显示骨架屏或空状态
	if (postsLength === 0) {
		return loading ? (
			<div className={cn('space-y-0', className)}>
				<FeedSkeleton count={5} />
			</div>
		) : (
			<div className={cn('text-center py-20', className)}>
				<div className="text-muted-foreground text-sm mb-4">暂无内容</div>
			</div>
		)
	}

	// 获取虚拟项目和样式
	const virtualItems = virtualizer.getVirtualItems()
	const itemStyle = { position: 'absolute' as const, top: 0, left: 0, width: '100%' }
	const loadMoreStyle = { position: 'absolute' as const, top: virtualizer.getTotalSize(), left: 0, width: '100%' }

	return (
		<div className={cn('flex-1 min-h-0', className)} data-slot="feed-list">
			{/* 虚拟滚动容器 */}
			<div ref={parentRef} className="h-full overflow-auto scrollbar-hide">
				<div
					style={{
						height: virtualizer.getTotalSize(),
						width: '100%',
						position: 'relative',
					}}
				>
					{/* 渲染可见的虚拟项目 */}
					{virtualItems.map((virtualItem) => {
						const post = posts[virtualItem.index]
						return (
							<div
								key={virtualItem.key}
								style={{ ...itemStyle, transform: `translateY(${virtualItem.start}px)` }}
								data-index={virtualItem.index}
								ref={(el) => virtualizer.measureElement(el)} // 让虚拟列表测量真实高度
							>
								{post ? <FeedItem post={post} onLike={onLike} onToggleExpand={onToggleExpand} onAddComment={onAddComment} /> : <FeedSkeleton count={1} />}
							</div>
						)
					})}

					{/* 底部加载状态 */}
					{postsLength > 0 && (
						<div style={loadMoreStyle} className="py-4">
							{loading && hasMore && <LoadMoreSkeleton />}
							{!hasMore && <div className="text-center text-muted-foreground text-sm py-8">没有更多内容了</div>}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export interface FeedListProps {
	posts: FeedPost[]
	loading: boolean
	hasMore: boolean
	onLike: (postId: string) => void
	onToggleExpand: (postId: string) => void
	onAddComment: (postId: string, content: string, replyTo?: string) => void
	onLoadMore: () => void
	className?: string
}
