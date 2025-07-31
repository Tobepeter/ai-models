import { useState, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { faker } from '@faker-js/faker'

const minH = 50
const maxH = 300

// 生成测试数据
const generateItems = (count: number) => {
	return Array.from({ length: count }, (_, i) => ({
		id: i,
		content: `Item ${i + 1} - ${faker.lorem.sentence(Math.floor(Math.random() * 5) + 1)}`,
		height: faker.number.int({ min: minH, max: maxH }),
	}))
}

const TestReactVirtual = () => {
	const [items] = useState(() => generateItems(1000))
	const [activeDemo, setActiveDemo] = useState<'basic' | 'dynamic' | 'horizontal' | 'grid'>('basic')

	// 基础虚拟化 - 固定高度
	const BasicVirtualizer = () => {
		const parentRef = useRef<HTMLDivElement>(null)

		const virtualizer = useVirtualizer({
			count: items.length,
			getScrollElement: () => parentRef.current,
			estimateSize: () => 80, // 固定高度
			// overscan: 5, // 预渲染额外项目数量，默认1
			// scrollMargin: 0, // 滚动边距
			// initialOffset: 0, // 初始滚动位置
			// initialRect: { width: 0, height: 0 }, // 初始容器尺寸
			// measureElement: undefined, // 自定义测量函数
			// scrollPaddingStart: 0, // 开始填充
			// scrollPaddingEnd: 0, // 结束填充
			// scrollingDelay: 150, // 滚动延迟检测
			// indexAttribute: 'data-index', // 索引属性名
			// initialMeasurementsCache: [], // 初始测量缓存
			// lanes: 1, // 列数，用于网格布局
		})

		return (
			<div
				ref={parentRef}
				className="h-[400px] overflow-auto border rounded"
				data-slot="basic-virtualizer"
				// style={{ contain: 'strict' }} // CSS containment优化
			>
				<div
					style={{
						height: `${virtualizer.getTotalSize()}px`,
						width: '100%',
						position: 'relative',
					}}
				>
					{virtualizer.getVirtualItems().map((virtualItem) => (
						<div
							key={virtualItem.key}
							data-index={virtualItem.index} // 用于调试
							ref={virtualizer.measureElement} // 自动测量
							className="absolute top-0 left-0 w-full p-4 bg-white border-red-500 border-2 box-border"
							style={{
								transform: `translateY(${virtualItem.start}px)`,
							}}
						>
							<div className="font-medium">#{items[virtualItem.index].id}</div>
							<div className="text-sm text-gray-600">{items[virtualItem.index].content}</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	// 动态高度虚拟化
	const DynamicVirtualizer = () => {
		const parentRef = useRef<HTMLDivElement>(null)

		const virtualizer = useVirtualizer({
			count: items.length,
			getScrollElement: () => parentRef.current,
			// estimateSize: (index) => items[index].height, // 动态高度估算
			estimateSize: () => 1, // 试试估摸高度到底是否影响布局
			// measureElement: (el) => el?.getBoundingClientRect().height ?? 0, // 自定义测量
			overscan: 10, // 动态高度需要更多预渲染
			// getItemKey: (index) => items[index].id, // 自定义key生成
		})

		return (
			<div ref={parentRef} className="h-[400px] overflow-auto border rounded" data-slot="dynamic-virtualizer">
				<div
					style={{
						height: `${virtualizer.getTotalSize()}px`,
						width: '100%',
						position: 'relative',
					}}
				>
					{virtualizer.getVirtualItems().map((virtualItem) => (
						<div
							key={virtualItem.key}
							data-index={virtualItem.index}
							ref={virtualizer.measureElement}
							className="absolute top-0 left-0 w-full p-4 border-b bg-white box-border border-red-500 border-2"
							style={{
								transform: `translateY(${virtualItem.start}px)`,
								minHeight: items[virtualItem.index].height,
							}}
						>
							<div className="font-medium">#{items[virtualItem.index].id}</div>
							<div className="text-sm text-gray-600">{items[virtualItem.index].content}</div>
							<div className="text-xs text-gray-400 mt-2">预估高度: {items[virtualItem.index].height}px</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	// 水平虚拟化
	const HorizontalVirtualizer = () => {
		const parentRef = useRef<HTMLDivElement>(null)

		const virtualizer = useVirtualizer({
			count: items.length,
			getScrollElement: () => parentRef.current,
			estimateSize: () => 200, // 固定宽度
			horizontal: true, // 水平滚动
			// paddingStart: 10, // 开始填充
			// paddingEnd: 10, // 结束填充
		})

		return (
			<div ref={parentRef} className="w-full h-[200px] overflow-auto border rounded" data-slot="horizontal-virtualizer">
				<div
					style={{
						width: `${virtualizer.getTotalSize()}px`,
						height: '100%',
						position: 'relative',
					}}
				>
					{virtualizer.getVirtualItems().map((virtualItem) => (
						<div
							key={virtualItem.key}
							data-index={virtualItem.index}
							ref={virtualizer.measureElement}
							className="absolute top-0 h-full p-4 border-r bg-white flex flex-col justify-center"
							style={{
								transform: `translateX(${virtualItem.start}px)`,
								width: '200px',
							}}
						>
							<div className="font-medium text-center">#{items[virtualItem.index].id}</div>
							<div className="text-sm text-gray-600 text-center truncate">{items[virtualItem.index].content}</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	// 网格虚拟化
	const GridVirtualizer = () => {
		const parentRef = useRef<HTMLDivElement>(null)
		const COLUMNS = 3
		const ITEM_HEIGHT = 120
		const ITEM_WIDTH = 150

		const rowVirtualizer = useVirtualizer({
			count: Math.ceil(items.length / COLUMNS),
			getScrollElement: () => parentRef.current,
			estimateSize: () => ITEM_HEIGHT,
			// lanes: COLUMNS, // 实验性功能
		})

		const columnVirtualizer = useVirtualizer({
			horizontal: true,
			count: COLUMNS,
			getScrollElement: () => parentRef.current,
			estimateSize: () => ITEM_WIDTH,
		})

		return (
			<div ref={parentRef} className="h-[400px] w-full overflow-auto border rounded" data-slot="grid-virtualizer">
				<div
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						width: `${columnVirtualizer.getTotalSize()}px`,
						position: 'relative',
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) =>
						columnVirtualizer.getVirtualItems().map((virtualColumn) => {
							const index = virtualRow.index * COLUMNS + virtualColumn.index
							if (index >= items.length) return null

							return (
								<div
									key={`${virtualRow.index}-${virtualColumn.index}`}
									className="absolute border bg-white p-2"
									style={{
										height: `${ITEM_HEIGHT}px`,
										width: `${ITEM_WIDTH}px`,
										transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
									}}
								>
									<div className="font-medium text-sm">#{items[index].id}</div>
									<div className="text-xs text-gray-600 truncate">{items[index].content}</div>
								</div>
							)
						})
					)}
				</div>
			</div>
		)
	}

	const demos = {
		basic: { component: BasicVirtualizer, title: '基础虚拟化 (固定高度)' },
		dynamic: { component: DynamicVirtualizer, title: '动态高度虚拟化' },
		horizontal: { component: HorizontalVirtualizer, title: '水平虚拟化' },
		grid: { component: GridVirtualizer, title: '网格虚拟化' },
	}

	const ActiveComponent = demos[activeDemo].component

	return (
		<div data-slot="test-react-virtual" className="p-4 space-y-4">
			<div className="border-b pb-4">
				<h2 className="text-lg font-semibold">@tanstack/react-virtual 配置测试</h2>
				<p className="text-sm text-gray-600">数据量: {items.length} 条</p>
			</div>

			{/* 切换按钮 */}
			<div className="flex gap-2 flex-wrap">
				{Object.entries(demos).map(([key, demo]) => (
					<button
						key={key}
						onClick={() => setActiveDemo(key as any)}
						className={`px-3 py-1 text-sm rounded border ${activeDemo === key ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
					>
						{demo.title}
					</button>
				))}
			</div>

			{/* 当前演示 */}
			<div className="space-y-2">
				<h3 className="font-medium">{demos[activeDemo].title}</h3>
				<ActiveComponent />
			</div>

			{/* 配置说明 */}
			<div className="mt-6 p-4 bg-gray-50 rounded text-sm">
				<h4 className="font-medium mb-2">主要配置选项:</h4>
				<ul className="space-y-1 text-gray-600">
					<li>
						• <code>count</code>: 总项目数量
					</li>
					<li>
						• <code>getScrollElement</code>: 滚动容器元素
					</li>
					<li>
						• <code>estimateSize</code>: 项目大小估算函数
					</li>
					<li>
						• <code>overscan</code>: 预渲染额外项目数量
					</li>
					<li>
						• <code>horizontal</code>: 水平滚动模式
					</li>
					<li>
						• <code>measureElement</code>: 自动测量元素大小
					</li>
					<li>
						• <code>scrollMargin</code>: 滚动边距
					</li>
					<li>
						• <code>initialOffset</code>: 初始滚动位置
					</li>
					<li>
						• <code>getItemKey</code>: 自定义key生成函数
					</li>
				</ul>
			</div>
		</div>
	)
}

export default TestReactVirtual
