import { Button } from '@/components/ui/button'
import { useVirtualizer } from '@tanstack/react-virtual'
import { MessageCircle, RefreshCw } from 'lucide-react'
import { useEffect, useRef } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { type FeedComment } from '../feed-store'
import { FeedCommentItem } from './feed-comment-item'

/**
 * Feed详情评论列表 - 虚拟滚动实现
 */
export const FeedDetailCommentList = (props: FeedDetailCommentListProps) => {
	const { comments, hasMore, loading, error, onAddComment, onLoadMore, onRetry } = props
	const parentRef = useRef<HTMLDivElement>(null)
	const commentsLength = comments.length

	const estimateSize = 120 // 评论项预估高度
	const overscan = 5

	// TanStack Virtual 配置
	const virtualizer = useVirtualizer({
		count: commentsLength,
		getScrollElement: () => parentRef.current,
		estimateSize: () => estimateSize,
		overscan: overscan,
	})

	// 基于索引判断无限滚动
	useEffect(() => {
		if (commentsLength === 0) return

		const virtualItems = virtualizer.getVirtualItems()
		if (!virtualItems.length) return

		const lastItem = virtualItems[virtualItems.length - 1]
		// 当最后可见项接近数据末尾时触发加载
		if (lastItem && lastItem.index >= commentsLength - 2 && hasMore && !loading) {
			onLoadMore()
		}
	}, [virtualizer.getVirtualItems(), commentsLength, hasMore, loading, onLoadMore])

	// 首次加载骨架屏
	if (loading && comments.length === 0) {
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

	// 无评论状态
	if (comments.length === 0) {
		return (
			<div className="flex items-center justify-center text-muted-foreground pt-10">
				<div className="text-center">
					<MessageCircle className="square-12 mx-auto mb-4 opacity-30" />
					<p className="text-sm">暂无评论</p>
					<p className="text-xs mt-1">来发表第一条评论吧</p>
				</div>
			</div>
		)
	}

	// 虚拟滚动评论列表
	const virtualItems = virtualizer.getVirtualItems()
	const itemStyle = { position: 'absolute' as const, top: 0, left: 0, width: '100%' }
	const loadMoreStyle = { position: 'absolute' as const, top: virtualizer.getTotalSize(), left: 0, width: '100%' }

	// 虚拟列表必须指定一个高度
	const rootClass = 'h-full'
	return (
		<div className={rootClass} data-slot="feed-detail-comment-list">
			{/* 虚拟滚动容器 */}
			<div ref={parentRef} className="h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
				<div
					style={{
						height: virtualizer.getTotalSize(),
						width: '100%',
						position: 'relative',
					}}
				>
					{/* 渲染可见的虚拟项目 */}
					{virtualItems.map((virtualItem) => {
						const comment = comments[virtualItem.index]
						return (
							<div
								key={virtualItem.key}
								style={{ ...itemStyle, transform: `translateY(${virtualItem.start}px)` }}
								data-index={virtualItem.index}
								ref={(el) => virtualizer.measureElement(el)} // 让虚拟列表测量真实高度
								className="px-6"
							>
								{comment ? (
									<FeedCommentItem comment={comment} onAddComment={onAddComment} />
								) : (
									<div className="py-4">
										<Skeleton width="30%" height={16} className="mb-2" />
										<Skeleton count={2} height={14} />
									</div>
								)}
							</div>
						)
					})}

					{/* 底部加载状态 */}
					{commentsLength > 0 && (
						<div style={loadMoreStyle} className="px-6 py-4">
							{loading && hasMore && (
								<div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
									<RefreshCw className="w-4 h-4 animate-spin" />
									<span>正在加载...</span>
								</div>
							)}
							{error && (
								<div className="flex items-center justify-center space-x-2">
									<span className="text-sm text-destructive">加载失败</span>
									<Button variant="ghost" size="sm" onClick={onRetry}>
										<RefreshCw className="w-4 h-4" />
										重试
									</Button>
								</div>
							)}
							{!hasMore && !loading && !error && <div className="text-center text-sm text-muted-foreground">没有更多评论了</div>}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export interface FeedDetailCommentListProps {
	comments: FeedComment[]
	hasMore: boolean
	loading: boolean
	error?: string
	onAddComment: (content: string, replyTo?: string) => void
	onLoadMore: () => void
	onRetry: () => void
}
