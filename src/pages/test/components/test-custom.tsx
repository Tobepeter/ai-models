import { ShimmerOp } from '@/components/common/shimmer-op'

/**
 * Flex 高度测试 - 解决 flex-1 子节点 100% 高度问题
 */
const TestCustom = () => {
	// 模拟数据
	const mockData = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}: This is a test content item with some longer text to show scrolling behavior.`)

	return (
		<div className="p-6 max-w-4xl mx-auto h-screen" data-slot="test-custom">
			<div className="space-y-6 h-full">
				<h1 className="text-2xl font-bold flex-shrink-0">Flex 高度测试</h1>

				<div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
					{/* 错误示例 - 使用 h-full */}
					<div className="space-y-4">
						<h2 className="text-lg font-semibold text-red-600">❌ 错误 (h-full)</h2>
						<div className="border rounded-lg p-4 flex flex-col bg-red-50" style={{ height: '300px' }}>
							{/* 固定内容 */}
							<div className="p-2 bg-white rounded mb-2">Header Content</div>

							{/* flex-1 容器 */}
							<div className="flex-1 min-h-0 bg-blue-100 p-2 rounded">
								<div className="text-sm mb-2">flex-1 容器</div>
								{/* 子节点使用 h-full - 这里有问题 */}
								<div className="h-full">
									<div className="h-full overflow-auto bg-white rounded p-2">
										{mockData.map((item, i) => (
											<div key={i} className="py-1 text-sm border-b border-gray-100">
												{item}
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* 正确示例 - 移除 h-full，依赖拉伸 */}
					<div className="space-y-4">
						<h2 className="text-lg font-semibold text-green-600">✅ 正确 (移除 h-full)</h2>
						<div className="border rounded-lg p-4 flex flex-col bg-green-50" style={{ height: '300px' }}>
							{/* 固定内容 */}
							<div className="flex-shrink-0 p-2 bg-white rounded mb-2">Header Content</div>

							{/* flex-1 容器 */}
							<div className="flex-1 min-h-0 bg-blue-100 p-2 rounded">
								<div className="text-sm mb-2">flex-1 容器</div>
								{/* 子节点移除 h-full，依赖默认拉伸 */}
								<div className="overflow-auto bg-white rounded p-2">
									<div className="text-xs text-gray-600 mb-2">拉伸子容器 (正确)</div>
									{mockData.map((item, i) => (
										<div key={i} className="py-1 text-sm border-b border-gray-100">
											{item}
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* 绝对定位方案 */}
				<div className="space-y-4">
					<h2 className="text-lg font-semibold text-blue-600">🔧 方案3: 绝对定位</h2>
					<div className="border rounded-lg p-4 flex flex-col bg-blue-50" style={{ height: '200px' }}>
						{/* 固定内容 */}
						<div className="flex-shrink-0 p-2 bg-white rounded mb-2">Header Content</div>

						{/* flex-1 容器设为 relative */}
						<div className="flex-1 min-h-0 bg-gray-100 p-2 rounded relative">
							<div className="text-sm mb-2">flex-1 relative 容器</div>
							{/* 子节点绝对定位填满父容器 */}
							<div className="absolute inset-2 top-8 overflow-auto bg-white rounded p-2">
								<div className="text-xs text-gray-600 mb-2">absolute inset-0 子容器</div>
								{mockData.slice(0, 20).map((item, i) => (
									<div key={i} className="py-1 text-sm border-b border-gray-100">
										{item}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TestCustom
