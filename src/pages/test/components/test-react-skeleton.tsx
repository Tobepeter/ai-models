import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useTheme } from 'next-themes'

/**
 * React Loading Skeleton 示例组件
 *
 * SkeletonTheme 主要参数：
 * - baseColor: 骨架屏的基础颜色（静止状态）
 * - highlightColor: 骨架屏的高亮颜色（动画闪烁色）
 * - borderRadius: 圆角大小，默认 4px
 * - duration: 动画持续时间，默认 1.2秒
 * - direction: 动画方向 'ltr' | 'rtl'，默认 'ltr'
 * - enableAnimation: 是否启用动画，默认 true
 * - height: 默认高度
 * - width: 默认宽度
 * - inline: 是否为内联元素，默认 false
 */
const TestReactSkeleton = () => {
	const { resolvedTheme } = useTheme()
	const isDark = resolvedTheme === 'dark'

	// NOTE：内部只有默认浅色逻辑，深色逻辑必须自己配置
	const themeColors = {
		light: {
			baseColor: '#f3f4f6', // gray-100
			highlightColor: '#e5e7eb', // gray-200
		},
		dark: {
			baseColor: '#374151', // gray-700
			highlightColor: '#4b5563', // gray-600
		},
	}

	// const currentColors = isDark ? themeColors.dark : themeColors.light
	const baseColor = isDark ? themeColors.dark.baseColor : undefined
	const highlightColor = isDark ? themeColors.dark.highlightColor : undefined

	return (
		<SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
			<div className="p-6 space-y-8" data-slot="test-react-skeleton">
				<h2 className="text-2xl font-bold mb-4">React Loading Skeleton 示例</h2>

				{/* 基础骨架屏 */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">基础骨架屏</h3>
					<div className="space-y-2">
						<Skeleton height={20} />
						<Skeleton height={20} width="80%" />
						<Skeleton height={20} width="60%" />
					</div>
				</div>

				{/* 圆形头像骨架屏 */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">头像和文本</h3>
					<div className="flex items-center space-x-3">
						<Skeleton circle height={40} width={40} />
						<div className="flex-1 space-y-2">
							<Skeleton height={16} width="30%" />
							<Skeleton height={14} width="50%" />
						</div>
					</div>
				</div>

				{/* 卡片骨架屏 */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">卡片骨架屏</h3>
					<div className="border rounded-lg p-4 space-y-3">
						<Skeleton height={200} />
						<div className="space-y-2">
							<Skeleton height={20} />
							<Skeleton height={16} width="70%" />
							<div className="flex justify-between">
								<Skeleton height={16} width="20%" />
								<Skeleton height={16} width="15%" />
							</div>
						</div>
					</div>
				</div>

				{/* 列表骨架屏 */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">列表骨架屏</h3>
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
								<Skeleton circle height={32} width={32} />
								<div className="flex-1 space-y-2">
									<Skeleton height={16} />
									<Skeleton height={14} width="60%" />
								</div>
								<Skeleton height={24} width={60} />
							</div>
						))}
					</div>
				</div>

				{/* 自定义主题演示 - 演示不同参数效果 */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">自定义主题参数演示</h3>

					{/* 更快的动画 */}
					<div className="space-y-2">
						<h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">快速动画 (duration: 0.8s)</h4>
						<SkeletonTheme duration={0.8}>
							<Skeleton height={20} />
							<Skeleton height={20} width="70%" />
						</SkeletonTheme>
					</div>

					{/* 无动画 */}
					<div className="space-y-2">
						<h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">静态骨架屏 (enableAnimation: false)</h4>
						<SkeletonTheme enableAnimation={false}>
							<Skeleton height={20} />
							<Skeleton height={20} width="70%" />
						</SkeletonTheme>
					</div>

					{/* 圆角效果 */}
					<div className="space-y-2">
						<h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">大圆角 (borderRadius: 16px)</h4>
						<SkeletonTheme borderRadius="16px">
							<Skeleton height={40} />
							<Skeleton height={40} width="60%" />
						</SkeletonTheme>
					</div>
				</div>

				{/* 模拟真实内容 */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">模拟真实内容布局</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{[1, 2].map((i) => (
							<div key={i} className="border rounded-lg overflow-hidden">
								<Skeleton height={150} />
								<div className="p-4 space-y-3">
									<Skeleton height={18} />
									<Skeleton height={14} count={2} />
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-2">
											<Skeleton circle height={24} width={24} />
											<Skeleton height={14} width={80} />
										</div>
										<Skeleton height={14} width={60} />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</SkeletonTheme>
	)
}

export default TestReactSkeleton
