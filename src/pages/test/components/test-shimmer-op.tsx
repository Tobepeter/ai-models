import { ShimmerOp } from '@/components/common/shimmer-op'

/**
 * 测试基于 opacity 的 shimmer 效果组件
 */
const TestShimmerOp = () => {
	return (
		<div className="p-6 max-w-2xl mx-auto" data-slot="test-shimmer-op">
			<div className="space-y-6">
				<h1 className="text-2xl font-bold">ShimmerOp 测试</h1>

				{/* 基本效果 */}
				<div className="space-y-4">
					<h2 className="text-lg font-semibold">基本效果</h2>
					<div className="text-lg">
						<ShimmerOp text="人工智能是一门综合性学科" />
					</div>
				</div>

				{/* 多行文本测试 */}
				<div className="space-y-4">
					<h2 className="text-lg font-semibold">多行文本</h2>
					<div className="space-y-2">
						<div className="text-base">
							<ShimmerOp text="现代AI主要基于机器学习技术，" />
						</div>
						<div className="text-base">
							<ShimmerOp text="特别是深度学习，通过大量数据训练模型" />
						</div>
						<div className="text-base">
							<ShimmerOp text="来实现智能行为。" />
						</div>
					</div>
				</div>

				{/* 长文本测试 */}
				<div className="space-y-4">
					<h2 className="text-lg font-semibold">长文本</h2>
					<div className="text-base">
						<ShimmerOp
							text="人工智能（Artificial Intelligence，简称AI）是一门综合性学科，涉及计算机科学、数学、认知科学、心理学等多个领域。它的核心目标是创造能够执行通常需要人类智能才能完成的任务的计算机系统。"
							range={8}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TestShimmerOp
