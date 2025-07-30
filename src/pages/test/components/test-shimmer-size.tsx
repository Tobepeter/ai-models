import { useTheme } from 'next-themes'
import { useState, CSSProperties } from 'react'

const TestShimmerSize = () => {
	const [showAnimation, setShowAnimation] = useState(true)
	const { theme } = useTheme()
	const color1 = 'transparent'
	const color2 = theme === 'dark' ? '#222' : '#e0e0e0'

	// NOTE: 貌似 background-position的算法非常复杂
	//  比如提供size 110%，实际上position的位移距离是按照多出来的10%作为梯度计算的（很慢），如果提供100%，是完全移动不了的

	// 100% 背景尺寸的 shimmer
	const shimmer100Style: CSSProperties = {
		width: '300px',
		height: '20px',
		borderRadius: '4px',
		background: `linear-gradient(90deg, ${color1} 25%, ${color2} 50%, ${color1} 75%)`,
		backgroundSize: '100% 100%',
		animation: showAnimation ? 'shimmer100 2s ease-in-out infinite' : 'none',
	}

	// 200% 背景尺寸的 shimmer
	const shimmer200Style: CSSProperties = {
		width: '300px',
		height: '20px',
		borderRadius: '4px',
		background: `linear-gradient(90deg, ${color1} 25%, ${color2} 50%, ${color1} 75%)`,
		backgroundSize: '200% 100%',
		animation: showAnimation ? 'shimmer200 2s ease-in-out infinite' : 'none',
	}

	// 400% 背景尺寸的 shimmer（更宽）
	const shimmer400Style: CSSProperties = {
		width: '300px',
		height: '20px',
		borderRadius: '4px',
		background: `linear-gradient(90deg, ${color1} 25%, ${color2} 50%, ${color1} 75%)`,
		backgroundSize: '400% 100%',
		animation: showAnimation ? 'shimmer400 2s ease-in-out infinite' : 'none',
	}

	return (
		<div className="p-6 space-y-8" data-slot="test-shimmer-size">
			<style>
				{`
          @keyframes shimmer100 {
            0% { background-position: -100% 0; }
            100% { background-position: 100% 0; }
          }
          
          @keyframes shimmer200 {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          @keyframes shimmer400 {
            0% { background-position: -400% 0; }
            100% { background-position: 400% 0; }
          }
        `}
			</style>

			<div className="flex items-center gap-4 mb-6">
				<h2 className="text-2xl font-bold">Shimmer 背景尺寸对比</h2>
				<button onClick={() => setShowAnimation(!showAnimation)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
					{showAnimation ? '暂停动画' : '开始动画'}
				</button>
			</div>

			<div className="space-y-6">
				<div className="space-y-3">
					<h3 className="text-lg font-semibold">100% 背景尺寸 (background-size: 100%)</h3>
					<p className="text-sm text-gray-600">渐变刚好填满容器，从 -100% 移动到 100%</p>
					<div style={shimmer100Style} />
					<p className="text-xs text-red-600">⚠️ 注意边缘可能出现突兀的切换，动画开始/结束时有"跳跃"感</p>
				</div>

				<div className="space-y-3">
					<h3 className="text-lg font-semibold">200% 背景尺寸 (background-size: 200%)</h3>
					<p className="text-sm text-gray-600">渐变是容器的2倍宽，从 -200% 移动到 200%</p>
					<div style={shimmer200Style} />
					<p className="text-xs text-green-600">✅ 平滑过渡，容器内始终看到完整的渐变效果</p>
				</div>

				<div className="space-y-3">
					<h3 className="text-lg font-semibold">400% 背景尺寸 (background-size: 400%)</h3>
					<p className="text-sm text-gray-600">渐变是容器的4倍宽，从 -400% 移动到 400%</p>
					<div style={shimmer400Style} />
					<p className="text-xs text-blue-600">📝 更宽的渐变，效果更加柔和但动画时间更长</p>
				</div>
			</div>

			<div className="mt-8 p-4 bg-gray-50 rounded-lg">
				<h4 className="font-semibold mb-2">原理解释：</h4>
				<ul className="text-sm space-y-1 text-gray-700">
					<li>
						• <strong>100%</strong>: 渐变宽度等于容器宽度，移动时边缘会产生硬切换
					</li>
					<li>
						• <strong>200%</strong>: 渐变宽度是容器的2倍，确保容器内始终有平滑过渡
					</li>
					<li>
						• <strong>400%</strong>: 渐变更宽，效果更柔和，但需要更大的移动距离
					</li>
				</ul>
				<p className="text-sm mt-2 text-gray-600">这就是为什么大多数骨架屏都使用200%的原因 - 平衡了平滑效果和性能！</p>
			</div>

			<div className="mt-8 p-4 bg-blue-50 rounded-lg">
				<h4 className="font-semibold mb-2">实际应用建议：</h4>
				<ul className="text-sm space-y-1 text-gray-700">
					<li>
						• 推荐使用 <strong>200%</strong> 作为标准配置
					</li>
					<li>• 如果需要更柔和的效果，可以尝试 300%-400%</li>
					<li>• 避免使用 100%，除非你确实想要硬边缘效果</li>
					<li>• 动画移动距离应该与背景尺寸匹配</li>
				</ul>
			</div>
		</div>
	)
}

export default TestShimmerSize
