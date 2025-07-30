import { useState } from 'react'

const TestGrid = () => {
	const [selectedExample, setSelectedExample] = useState('basic')

	const examples = {
		basic: {
			title: '基础网格',
			description: '3列等宽网格',
			component: (
				<div className="grid grid-cols-3 gap-4 p-4">
					{Array.from({ length: 6 }, (_, idx) => (
						<div key={idx} className="bg-blue-100 p-4 rounded text-center">
							Item {idx + 1}
						</div>
					))}
				</div>
			),
		},
		responsive: {
			title: '响应式网格',
			description: '手机1列，平板2列，桌面3列',
			component: (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
					{Array.from({ length: 6 }, (_, idx) => (
						<div key={idx} className="bg-green-100 p-4 rounded text-center">
							Item {idx + 1}
						</div>
					))}
				</div>
			),
		},
		span: {
			title: '跨列布局',
			description: '某些项目跨多列',
			component: (
				<div className="grid grid-cols-4 gap-4 p-4">
					<div className="bg-red-100 p-4 rounded text-center col-span-2">跨2列</div>
					<div className="bg-blue-100 p-4 rounded text-center">Item 2</div>
					<div className="bg-blue-100 p-4 rounded text-center">Item 3</div>
					<div className="bg-blue-100 p-4 rounded text-center">Item 4</div>
					<div className="bg-red-100 p-4 rounded text-center col-span-3">跨3列</div>
					<div className="bg-green-100 p-4 rounded text-center col-span-4">跨全部4列</div>
				</div>
			),
		},
		autoFit: {
			title: '自适应列数',
			description: '根据容器宽度自动调整列数',
			component: (
				<div className="grid gap-4 p-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
					{Array.from({ length: 8 }, (_, idx) => (
						<div key={idx} className="bg-purple-100 p-4 rounded text-center">
							Auto Item {idx + 1}
						</div>
					))}
				</div>
			),
		},
		autoFill: {
			title: '自动填充',
			description: 'auto-fill vs auto-fit 对比',
			component: (
				<div className="space-y-6 p-4">
					<div>
						<h4 className="mb-2 font-semibold">auto-fit (收缩到内容)</h4>
						<div className="grid gap-4 border-2 border-dashed border-gray-300" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
							{Array.from({ length: 3 }, (_, idx) => (
								<div key={idx} className="bg-yellow-100 p-4 rounded text-center">
									Fit {idx + 1}
								</div>
							))}
						</div>
					</div>
					<div>
						<h4 className="mb-2 font-semibold">auto-fill (保持空列)</h4>
						<div className="grid gap-4 border-2 border-dashed border-gray-300" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
							{Array.from({ length: 3 }, (_, idx) => (
								<div key={idx} className="bg-orange-100 p-4 rounded text-center">
									Fill {idx + 1}
								</div>
							))}
						</div>
					</div>
				</div>
			),
		},
		areas: {
			title: '网格区域',
			description: '使用 grid-template-areas 布局',
			component: (
				<div
					className="grid gap-4 p-4 h-96"
					style={{
						gridTemplateAreas: `
							"header header header"
							"sidebar main main"
							"sidebar footer footer"
						`,
						gridTemplateColumns: '200px 1fr 1fr',
						gridTemplateRows: '80px 1fr 80px',
					}}
				>
					<div className="bg-red-100 p-4 rounded flex items-center justify-center" style={{ gridArea: 'header' }}>
						Header
					</div>
					<div className="bg-blue-100 p-4 rounded flex items-center justify-center" style={{ gridArea: 'sidebar' }}>
						Sidebar
					</div>
					<div className="bg-green-100 p-4 rounded flex items-center justify-center" style={{ gridArea: 'main' }}>
						Main Content
					</div>
					<div className="bg-yellow-100 p-4 rounded flex items-center justify-center" style={{ gridArea: 'footer' }}>
						Footer
					</div>
				</div>
			),
		},
		dense: {
			title: '密集布局',
			description: 'grid-auto-flow: dense 自动填充空隙',
			component: (
				<div className="grid grid-cols-4 gap-4 p-4" style={{ gridAutoFlow: 'dense' }}>
					<div className="bg-red-100 p-4 rounded text-center col-span-2">Wide 1</div>
					<div className="bg-blue-100 p-4 rounded text-center">Item 2</div>
					<div className="bg-green-100 p-4 rounded text-center">Item 3</div>
					<div className="bg-yellow-100 p-4 rounded text-center">Item 4</div>
					<div className="bg-purple-100 p-4 rounded text-center col-span-3">Very Wide 5</div>
					<div className="bg-pink-100 p-4 rounded text-center">Item 6</div>
					<div className="bg-indigo-100 p-4 rounded text-center">Item 7</div>
					<div className="bg-gray-100 p-4 rounded text-center">Item 8</div>
				</div>
			),
		},
		alignment: {
			title: '对齐方式',
			description: '网格项目的各种对齐方式',
			component: (
				<div className="grid grid-cols-3 gap-4 p-4 h-96">
					<div className="bg-red-100 rounded flex items-start justify-start p-4">
						<div className="bg-red-300 p-2 rounded">start-start</div>
					</div>
					<div className="bg-blue-100 rounded flex items-center justify-center p-4">
						<div className="bg-blue-300 p-2 rounded">center-center</div>
					</div>
					<div className="bg-green-100 rounded flex items-end justify-end p-4">
						<div className="bg-green-300 p-2 rounded">end-end</div>
					</div>
					<div className="bg-yellow-100 rounded flex items-stretch justify-stretch p-4">
						<div className="bg-yellow-300 p-2 rounded w-full">stretch</div>
					</div>
					<div className="bg-purple-100 rounded flex items-center justify-between p-4">
						<div className="bg-purple-300 p-2 rounded">between</div>
					</div>
					<div className="bg-pink-100 rounded flex items-center justify-around p-4">
						<div className="bg-pink-300 p-2 rounded">around</div>
					</div>
				</div>
			),
		},
		minmax: {
			title: 'minmax 函数',
			description: '设置列的最小和最大尺寸',
			component: (
				<div className="grid gap-4 p-4" style={{ gridTemplateColumns: 'minmax(100px, 200px) minmax(200px, 1fr) minmax(150px, 300px)' }}>
					{Array.from({ length: 6 }, (_, idx) => (
						<div key={idx} className="bg-teal-100 p-4 rounded text-center">
							Minmax {idx + 1}
						</div>
					))}
				</div>
			),
		},
		fractional: {
			title: 'fr 单位',
			description: '使用 fr 单位分配剩余空间',
			component: (
				<div className="grid gap-4 p-4" style={{ gridTemplateColumns: '1fr 2fr 1fr' }}>
					<div className="bg-red-100 p-4 rounded text-center">1fr</div>
					<div className="bg-blue-100 p-4 rounded text-center">2fr (双倍宽度)</div>
					<div className="bg-green-100 p-4 rounded text-center">1fr</div>
				</div>
			),
		},
	}

	const exampleKeys = Object.keys(examples) as Array<keyof typeof examples>

	return (
		<div className="p-6 max-w-6xl mx-auto" data-slot="test-grid">
			<h2 className="text-2xl font-bold mb-6">CSS Grid 布局练习</h2>

			{/* 示例选择器 */}
			<div className="mb-6">
				<div className="flex flex-wrap gap-2">
					{exampleKeys.map((key) => (
						<button
							key={key}
							onClick={() => setSelectedExample(key)}
							className={`px-4 py-2 rounded transition-colors ${selectedExample === key ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
						>
							{examples[key].title}
						</button>
					))}
				</div>
			</div>

			{/* 当前示例 */}
			<div className="border rounded-lg overflow-hidden">
				<div className="bg-gray-50 p-4 border-b">
					<h3 className="text-lg font-semibold">{examples[selectedExample].title}</h3>
					<p className="text-gray-600">{examples[selectedExample].description}</p>
				</div>
				<div className="bg-white">{examples[selectedExample].component}</div>
			</div>

			{/* 说明文档 */}
			<div className="mt-8 p-4 bg-gray-50 rounded-lg">
				<h4 className="font-semibold mb-2">Grid 常用属性速查：</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
					<div>
						<strong>容器属性：</strong>
						<ul className="list-disc list-inside mt-1 space-y-1">
							<li>grid-template-columns: 定义列</li>
							<li>grid-template-rows: 定义行</li>
							<li>grid-template-areas: 定义区域</li>
							<li>gap: 设置间距</li>
							<li>grid-auto-flow: 自动放置算法</li>
						</ul>
					</div>
					<div>
						<strong>项目属性：</strong>
						<ul className="list-disc list-inside mt-1 space-y-1">
							<li>grid-column: 列位置</li>
							<li>grid-row: 行位置</li>
							<li>grid-area: 区域名称</li>
							<li>justify-self: 水平对齐</li>
							<li>align-self: 垂直对齐</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TestGrid
