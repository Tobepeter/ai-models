import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { PropsWithChildren } from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

/**
 * 单个信息流项目骨架屏
 */
const FeedItemSkeleton = () => (
	<article className="bg-card" data-slot="feed-item-skeleton">
		<div className="rounded-lg border border-border/20">
			<div className="p-4">
				{/* 头部信息栏 */}
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-start space-x-3 flex-1">
						<Skeleton circle width={40} height={40} className="flex-shrink-0" />
						<div className="flex-1 space-y-1">
							<div className="flex items-center space-x-2">
								<Skeleton width={80} height={16} />
								<Skeleton width={20} height={20} />
							</div>
							<Skeleton width={60} height={12} />
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Skeleton width={32} height={32} borderRadius={4} />
						<Skeleton width={32} height={32} borderRadius={4} />
					</div>
				</div>

				{/* 文字内容栏 */}
				<div className="space-y-2 mb-3">
					<Skeleton height={16} />
					<Skeleton height={16} width="85%" />
					<Skeleton height={16} width="65%" />
				</div>

				{/* 图片占位栏 */}
				<Skeleton height={300} className="mb-3" borderRadius={8} />
			</div>

			{/* 交互按钮栏 */}
			<div className="px-4 pb-4">
				<div className="flex items-center space-x-6">
					<div className="flex items-center space-x-2">
						<Skeleton width={20} height={20} />
						<Skeleton width={24} height={12} />
					</div>
					<div className="flex items-center space-x-2">
						<Skeleton width={20} height={20} />
						<Skeleton width={24} height={12} />
					</div>
					<div className="flex items-center space-x-2">
						<Skeleton width={20} height={20} />
					</div>
				</div>
			</div>
		</div>

		{/* 评论区域 */}
		<div className="px-4 pb-4">
			<div className="space-y-3">
				<div className="flex items-start space-x-3">
					<Skeleton circle width={32} height={32} />
					<div className="flex-1 space-y-1">
						<Skeleton width={60} height={12} />
						<Skeleton height={14} width="90%" />
					</div>
				</div>
				<div className="flex items-start space-x-3">
					<Skeleton circle width={32} height={32} />
					<div className="flex-1 space-y-1">
						<Skeleton width={70} height={12} />
						<Skeleton height={14} width="75%" />
					</div>
				</div>
			</div>
		</div>
	</article>
)

/** 响应深色主题 */
const FeedThemeWrap = (props: PropsWithChildren<any>) => {
	const { children } = props
	const { resolvedTheme } = useTheme()
	const darkBaseColor = '#374151'
	const darkHighlightColor = '#4b5563'
	const baseColor = resolvedTheme === 'dark' ? darkBaseColor : undefined
	const highlightColor = resolvedTheme === 'dark' ? darkHighlightColor : undefined
	return (
		<SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
			{children}
		</SkeletonTheme>
	)
}

/**
 * 信息流骨架屏组件
 */
export const FeedSkeleton = (props: FeedSkeletonProps) => {
	const { className, count = 3 } = props
	return (
		<FeedThemeWrap>
			<div className={cn('space-y-4 w-full', className)} data-slot="feed-skeleton">
				{Array.from({ length: count }, (_, index) => (
					<FeedItemSkeleton key={index} />
				))}
			</div>
		</FeedThemeWrap>
	)
}

/**
 * 加载更多骨架屏
 */
export const FeedLoadMoreSkeleton = (props: { className?: string }) => {
	const { className } = props
	return (
		<FeedThemeWrap>
			<div className={cn('p-4 flex items-center justify-center space-x-2', className)} data-slot="load-more-skeleton">
				<Skeleton circle width={16} height={16} />
				<Skeleton width={80} height={16} />
			</div>
		</FeedThemeWrap>
	)
}

/**
 * 刷新骨架屏
 */
export const FeedRefreshSkeleton = (props: { className?: string }) => {
	const { className } = props
	return (
		<FeedThemeWrap>
			<div className={cn('p-4 flex items-center justify-center space-x-2', className)} data-slot="refresh-skeleton">
				<Skeleton circle width={20} height={20} />
				<Skeleton width={64} height={16} />
			</div>
		</FeedThemeWrap>
	)
}

export interface FeedSkeletonProps {
	className?: string
	count?: number
}
