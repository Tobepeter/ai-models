import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Loader2, Sparkles, Zap, Star } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Shimmer 效果测试组件
 */
const TestShimmer = () => {
	// 颜色配置
	const colors = {
		white: 'white',
		purple200: 'rgb(233 213 255)',
		gray300: 'rgb(209 213 219)',
		purple400: 'rgb(147 51 234)',
		yellow400: 'rgb(251 191 36)',
		yellow200: 'rgb(254 240 138)',
		red400: 'rgb(248 113 113)',
		green400: 'rgb(74 222 128)',
		blue400: 'rgb(96 165 250)',
		purple500: 'rgb(168 85 247)',
		cyan300: 'rgb(103 232 249)',
		pink300: 'rgb(249 168 212)',
	}

	// Shimmer 效果配置
	const shimmerConfigs = [
		{
			name: 'Golden Shimmer',
			gradient: `linear-gradient(to right, ${colors.yellow400}, ${colors.yellow200}, ${colors.yellow400})`,
			backgroundPosition: ['-200% 0', '200% 0', '-200% 0'],
			duration: 2.5,
			backgroundSize: '200% 100%',
		},
		{
			name: 'Rainbow Effect',
			gradient: `linear-gradient(to right, ${colors.red400}, ${colors.yellow400}, ${colors.green400}, ${colors.blue400}, ${colors.purple500})`,
			backgroundPosition: ['-400% 0', '400% 0'],
			duration: 3,
			backgroundSize: '400% 100%',
		},
		{
			name: 'Ocean Wave',
			gradient: `linear-gradient(to right, ${colors.blue400}, ${colors.cyan300}, ${colors.blue400})`,
			backgroundPosition: ['-200% 0', '200% 0'],
			duration: 2.8,
			backgroundSize: '200% 100%',
		},
		{
			name: 'Purple Magic',
			gradient: `linear-gradient(to right, ${colors.purple500}, ${colors.pink300}, ${colors.purple500})`,
			backgroundPosition: ['-200% 0', '200% 0'],
			duration: 2,
			backgroundSize: '200% 100%',
		},
	]

	return (
		<div className="p-6 space-y-8" data-slot="test-shimmer">
			{/* 主标题 */}
			<div className="text-center space-y-4">
				<motion.h1
					className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text"
					style={{
						backgroundSize: '200% 100%',
						backgroundImage: `linear-gradient(to right, ${colors.white}, ${colors.purple200}, ${colors.white})`,
					}}
					animate={{ backgroundPosition: ['-200% 0', '200% 0'] }}
					transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
				>
					SHIMMER 效果
				</motion.h1>
				<motion.p
					className="text-lg text-transparent bg-clip-text"
					style={{
						backgroundSize: '200% 100%',
						backgroundImage: `linear-gradient(to right, ${colors.gray300}, ${colors.white}, ${colors.gray300})`,
					}}
					animate={{ backgroundPosition: ['-200% 0', '200% 0'] }}
					transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
				>
					各种炫酷的文字扫光效果展示
				</motion.p>
			</div>

			{/* 聊天消息 shimmer */}
			<div className="space-y-4">
				<h4 className="font-medium">聊天消息加载效果</h4>
				<div className="flex w-full justify-start">
					<div className="flex max-w-[85%] flex-row">
						<Avatar className="w-8 h-8 mr-2">
							<AvatarFallback>AI</AvatarFallback>
						</Avatar>
						<div className="px-4 py-2 rounded-lg bg-muted">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Loader2 className="w-4 h-4 animate-spin" />
								<motion.span
									className="text-transparent bg-clip-text"
									style={{
										/**
										 * 宽度其实100 200都行
										 * 只是200拉长两倍，过渡的颜色被拉长，看起来更柔顺
										 */
										backgroundSize: '200% 100%',
										backgroundImage: `linear-gradient(to right, currentColor, ${colors.purple400}, currentColor)`,
									}}
									animate={{ backgroundPosition: ['-200% 0', '200% 0'] }}
									transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
								>
									正在思考
								</motion.span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* 多种 shimmer 效果 */}
			<div className="space-y-4">
				<h4 className="font-medium">多种 Shimmer 效果</h4>
				<div className="space-y-4">
					{shimmerConfigs.map((config, index) => (
						<motion.div
							key={index}
							className="text-2xl font-bold text-transparent bg-clip-text"
							style={{
								backgroundSize: config.backgroundSize,
								backgroundImage: config.gradient,
							}}
							animate={{ backgroundPosition: config.backgroundPosition }}
							transition={{ duration: config.duration, repeat: Infinity }}
						>
							{config.name}
						</motion.div>
					))}
				</div>
			</div>

			{/* 装饰元素 */}
			<div className="flex justify-center items-center space-x-8 opacity-60">
				<motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
					<Zap className="text-yellow-400 w-6 h-6" />
				</motion.div>
				<motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
					<Star className="text-purple-400 w-6 h-6" />
				</motion.div>
				<motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
					<Sparkles className="text-pink-400 w-6 h-6" />
				</motion.div>
			</div>
		</div>
	)
}

export default TestShimmer
