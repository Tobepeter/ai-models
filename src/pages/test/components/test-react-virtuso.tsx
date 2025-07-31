import { useState } from 'react'
import { Virtuoso } from 'react-virtuoso'

// 生成不同高度的测试数据
const generateItems = (count: number) =>
	Array.from({ length: count }, (_, i) => ({
		id: i,
		content: `Item ${i + 1} - ${'内容 '.repeat(Math.floor(Math.random() * 10) + 1)}`,
		height: Math.floor(Math.random() * 200) + 50, // 50-250px随机高度
	}))

const TestReactVirtuso = () => {
	const [items, setItems] = useState(() => generateItems(1000))

	const loadMore = () => {
		const newItems = generateItems(100).map((item, idx) => ({
			...item,
			id: items.length + idx,
		}))
		setItems((prev) => [...prev, ...newItems])
	}

	return (
		<div data-slot="test-react-virtual" className="h-[500px] flex flex-col">
			<div className="p-4 border-b bg-gray-50">
				<h2 className="text-lg font-semibold">React Virtuoso 动态高度测试</h2>
				<p className="text-sm text-gray-600">当前: {items.length} 条</p>
			</div>

			<div className="flex-1">
				<Virtuoso
					data={items}
					itemContent={(idx, item) => (
						<div data-slot="item" className="p-4 m-2 border rounded" style={{ minHeight: item.height }}>
							<div className="font-medium">#{item.id}</div>
							<div className="text-sm text-gray-600">{item.content}</div>
							<div className="text-xs text-gray-400 mt-2">高度: {item.height}px</div>
						</div>
					)}
					endReached={loadMore}
				/>
			</div>
		</div>
	)
}

export default TestReactVirtuso
