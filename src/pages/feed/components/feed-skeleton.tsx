import { cn } from '@/lib/utils'

interface FeedSkeletonProps {
	className?: string
	count?: number
}

/* 骨架屏基础组件 - 带动画效果 */
const SkeletonBox = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn('bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded', 'animate-[shimmer_1.5s_ease-in-out_infinite]', className)} {...props} />
)

/* 单个信息流项目骨架屏 */
const FeedItemSkeleton = () => (
	<div className="p-4 border-b border-gray-100">
		{/* 头部信息栏 */}
		<div className="flex items-start space-x-3 mb-3">
			<SkeletonBox className="w-10 h-10 rounded-full flex-shrink-0" />
			<div className="flex-1 space-y-2">
				<div className="flex items-center space-x-2">
					<SkeletonBox className="h-4 w-16" />
					<SkeletonBox className="h-3 w-3 rounded-full" />
					<SkeletonBox className="h-3 w-12" />
				</div>
			</div>
		</div>

		<div className="space-y-3">
			{/* 文字内容栏 */}
			<div className="space-y-2">
				<SkeletonBox className="h-4 w-full" />
				<SkeletonBox className="h-4 w-4/5" />
				<SkeletonBox className="h-4 w-3/5" />
			</div>

			{/* 图片占位栏 */}
			<SkeletonBox className="h-48 w-full rounded-lg" />

			{/* 交互按钮栏 */}
			<div className="flex items-center space-x-6 pt-2">
				<div className="flex items-center space-x-1">
					<SkeletonBox className="w-5 h-5 rounded" />
					<SkeletonBox className="h-3 w-6" />
				</div>
				<div className="flex items-center space-x-1">
					<SkeletonBox className="w-5 h-5 rounded" />
					<SkeletonBox className="h-3 w-6" />
				</div>
				<div className="flex items-center space-x-1">
					<SkeletonBox className="w-5 h-5 rounded" />
				</div>
			</div>
		</div>
	</div>
)

/* 信息流骨架屏组件 */
export const FeedSkeleton = ({ className, count = 3 }: FeedSkeletonProps) => (
	<div className={cn('space-y-0', className)}>
		{Array.from({ length: count }, (_, index) => (
			<FeedItemSkeleton key={index} />
		))}
	</div>
)

/* 加载更多骨架屏 */
export const LoadMoreSkeleton = ({ className }: { className?: string }) => (
	<div className={cn('p-4 flex items-center justify-center space-x-2', className)}>
		<SkeletonBox className="w-4 h-4 rounded-full" />
		<SkeletonBox className="h-4 w-20" />
	</div>
)

/* 刷新骨架屏 */
export const RefreshSkeleton = ({ className }: { className?: string }) => (
	<div className={cn('p-4 flex items-center justify-center space-x-2', className)}>
		<SkeletonBox className="w-5 h-5 rounded-full" />
		<SkeletonBox className="h-4 w-16" />
	</div>
)
