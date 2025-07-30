import { useEffect, useRef, useState, CSSProperties } from 'react'
import { FixedSizeList as List } from 'react-window'
import { useInViewport } from 'ahooks'
import { FeedItem } from './feed-item'
import { FeedSkeleton, LoadMoreSkeleton } from './feed-skeleton'
import { type FeedPost } from '../feed-store'
import { cn } from '@/lib/utils'

/** 预估的单个项目高度 */
const ESTIMATED_ITEM_HEIGHT = 200

/** 虚拟滚动的缓冲区大小 */
const OVERSCAN_COUNT = 5

/**
 * 虚拟滚动信息流列表组件
 */
export const FeedList = (props: FeedListProps) => {
	const { posts, loading, hasMore, onLike, onToggleExpand, onAddComment, onLikeComment, onReply, onLoadMore, className } = props

	const listRef = useRef<List>(null)
	const [listHeight, setListHeight] = useState(600)
	const loadMoreRef = useRef<HTMLDivElement>(null)
	const [loadMoreInViewport] = useInViewport(loadMoreRef)

	// 动态计算列表高度
	useEffect(() => {
		const updateHeight = () => {
			const windowHeight = window.innerHeight
			const headerHeight = 80 // 估算头部高度
			const footerHeight = 80 // 估算底部高度
			setListHeight(windowHeight - headerHeight - footerHeight)
		}

		updateHeight()
		window.addEventListener('resize', updateHeight)
		return () => window.removeEventListener('resize', updateHeight)
	}, [])

	// 触底加载更多
	useEffect(() => {
		if (loadMoreInViewport && hasMore && !loading) {
			onLoadMore()
		}
	}, [loadMoreInViewport, hasMore, loading, onLoadMore])

	// 渲染单个列表项
	const renderItem = ({ index, style }: { index: number; style: CSSProperties }) => {
		const post = posts[index]

		if (!post) {
			return (
				<div style={style}>
					<FeedSkeleton count={1} />
				</div>
			)
		}

		return (
			<div style={style}>
				<FeedItem post={post} onLike={onLike} onToggleExpand={onToggleExpand} onAddComment={onAddComment} onLikeComment={onLikeComment} onReply={onReply} />
			</div>
		)
	}

	// 如果没有数据且正在加载，显示骨架屏
	if (posts.length === 0 && loading) {
		return (
			<div className={cn('space-y-0', className)}>
				<FeedSkeleton count={5} />
			</div>
		)
	}

	// 如果没有数据且不在加载，显示空状态
	if (posts.length === 0) {
		return (
			<div className={cn('text-center py-20', className)}>
				<div className="text-muted-foreground text-sm mb-4">暂无内容</div>
			</div>
		)
	}

	return (
		<div className={cn('w-full', className)} data-slot="feed-list">
			{/* 虚拟滚动列表 */}
			<List
				ref={listRef}
				height={listHeight}
				width="100%"
				itemCount={posts.length}
				itemSize={ESTIMATED_ITEM_HEIGHT}
				overscanCount={OVERSCAN_COUNT}
				className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
			>
				{renderItem}
			</List>

			{/* 加载更多区域 */}
			<div ref={loadMoreRef} className="py-4">
				{loading && hasMore && <LoadMoreSkeleton />}

				{!hasMore && posts.length > 0 && <div className="text-center text-muted-foreground text-sm py-8">没有更多内容了</div>}
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
	onLikeComment?: (commentId: string) => void
	onReply?: (postId: string, username: string) => void
	onLoadMore: () => void
	className?: string
}
