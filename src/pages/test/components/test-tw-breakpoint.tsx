import { useEffect, useState } from 'react'

export const TestTwBreakpoint = () => {
	const [windowWidth, setWindowWidth] = useState(window.innerWidth)

	useEffect(() => {
		const handleResize = () => setWindowWidth(window.innerWidth)
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	const getBreakpoint = (width: number) => {
		if (width >= 1536) return '2xl'
		if (width >= 1280) return 'xl'
		if (width >= 1024) return 'lg'
		if (width >= 768) return 'md'
		if (width >= 640) return 'sm'
		return 'xs'
	}

	const breakpoint = getBreakpoint(windowWidth)

	return (
		<div className="p-4 space-y-6">
			{/* 当前宽度显示 */}
			<div className="fixed top-4 right-4 bg-black/80 text-white px-3 py-2 rounded text-sm font-mono z-50">
				{windowWidth}px ({breakpoint})
			</div>

			<div className="space-y-6">
				<h1 className="text-2xl font-bold">Tailwind CSS Breakpoint 测试</h1>

				{/* 断点说明 */}
				<div className="bg-white p-4 rounded-lg shadow">
					<h2 className="text-lg font-semibold mb-3">断点说明</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
						<div className="p-3 bg-gray-50 rounded">
							<strong>xs (默认)</strong><br />
							0px - 639px<br />
							<span className="text-gray-600">移动设备</span>
						</div>
						<div className="p-3 bg-blue-50 rounded">
							<strong>sm</strong><br />
							640px+<br />
							<span className="text-gray-600">大手机</span>
						</div>
						<div className="p-3 bg-green-50 rounded">
							<strong>md</strong><br />
							768px+<br />
							<span className="text-gray-600">平板</span>
						</div>
						<div className="p-3 bg-yellow-50 rounded">
							<strong>lg</strong><br />
							1024px+<br />
							<span className="text-gray-600">小桌面</span>
						</div>
						<div className="p-3 bg-purple-50 rounded">
							<strong>xl</strong><br />
							1280px+<br />
							<span className="text-gray-600">桌面</span>
						</div>
						<div className="p-3 bg-pink-50 rounded">
							<strong>2xl</strong><br />
							1536px+<br />
							<span className="text-gray-600">大桌面</span>
						</div>
					</div>
				</div>

				{/* 响应式网格 */}
				<div className="bg-white p-4 rounded-lg shadow">
					<h2 className="text-lg font-semibold mb-3">响应式网格布局</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
						{Array.from({ length: 6 }, (_, i) => (
							<div key={i} className="bg-blue-100 p-3 rounded text-center text-sm">
								卡片 {i + 1}
								<div className="text-xs text-gray-600 mt-1">
									<span className="sm:hidden">1列</span>
									<span className="hidden sm:block md:hidden">2列</span>
									<span className="hidden md:block lg:hidden">3列</span>
									<span className="hidden lg:block xl:hidden">4列</span>
									<span className="hidden xl:block 2xl:hidden">5列</span>
									<span className="hidden 2xl:block">6列</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* 响应式文字 */}
				<div className="bg-white p-4 rounded-lg shadow">
					<h2 className="text-lg font-semibold mb-3">响应式文字大小</h2>
					<p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
						这段文字会根据屏幕大小调整：
						<span className="sm:hidden"> 小屏 (text-sm)</span>
						<span className="hidden sm:block md:hidden"> sm屏 (text-base)</span>
						<span className="hidden md:block lg:hidden"> md屏 (text-lg)</span>
						<span className="hidden lg:block xl:hidden"> lg屏 (text-xl)</span>
						<span className="hidden xl:block 2xl:hidden"> xl屏 (text-2xl)</span>
						<span className="hidden 2xl:block"> 2xl屏 (text-3xl)</span>
					</p>
				</div>

				{/* 显示/隐藏测试 */}
				<div className="bg-white p-4 rounded-lg shadow">
					<h2 className="text-lg font-semibold mb-3">响应式显示/隐藏</h2>
					<div className="space-y-2">
						<div className="p-3 bg-red-100 rounded sm:hidden">
							📱 只在小屏显示 (默认显示, sm:hidden)
						</div>
						<div className="p-3 bg-blue-100 rounded hidden sm:block md:hidden">
							📱 只在 sm 显示 (640px - 767px)
						</div>
						<div className="p-3 bg-green-100 rounded hidden md:block lg:hidden">
							💻 只在 md 显示 (768px - 1023px)
						</div>
						<div className="p-3 bg-yellow-100 rounded hidden lg:block xl:hidden">
							🖥️ 只在 lg 显示 (1024px - 1279px)
						</div>
						<div className="p-3 bg-purple-100 rounded hidden xl:block 2xl:hidden">
							🖥️ 只在 xl 显示 (1280px - 1535px)
						</div>
						<div className="p-3 bg-pink-100 rounded hidden 2xl:block">
							🖥️ 只在 2xl 显示 (1536px+)
						</div>
					</div>
				</div>

				{/* 响应式间距 */}
				<div className="bg-white rounded-lg shadow p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12">
					<h2 className="text-lg font-semibold mb-3">响应式间距</h2>
					<div className="bg-gray-100 rounded p-4 text-center">
						<p>容器内边距会随屏幕大小变化：</p>
						<div className="text-sm text-gray-600 mt-2">
							<span className="sm:hidden">p-2 (8px)</span>
							<span className="hidden sm:block md:hidden">p-4 (16px)</span>
							<span className="hidden md:block lg:hidden">p-6 (24px)</span>
							<span className="hidden lg:block xl:hidden">p-8 (32px)</span>
							<span className="hidden xl:block 2xl:hidden">p-10 (40px)</span>
							<span className="hidden 2xl:block">p-12 (48px)</span>
						</div>
					</div>
				</div>

				<div className="text-center text-gray-600 text-sm bg-white p-4 rounded-lg">
					💡 提示：调整浏览器窗口大小或使用开发者工具的设备模拟器来测试不同断点
				</div>
			</div>
		</div>
	)
}
