import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

/**
 * 封面展示
 */
export const Cover = () => {
	const lightImg = 'https://images.unsplash.com/photo-1707209856575-a80b9dff5524?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
	const darkImg = 'https://images.unsplash.com/photo-1562907550-096d3bf9b25c?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

	const { resolvedTheme } = useTheme()

	// light 图片默认有点blur的感觉了，所以不需要额外blur了
	const imgCls = cn('w-full h-full object-cover', resolvedTheme === 'dark' ? 'blur-sm' : '')
	
	return (
		<div className="absolute inset-0">
			<img src={resolvedTheme === 'dark' ? darkImg : lightImg} alt="cover" className={imgCls} />
		</div>
	)
}
