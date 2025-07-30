import { ThemeToggle } from '@/components/common/theme-toggle'
import { MyAvatar } from '@/pages/user/components/my-avatar'
import { ArrowLeft, Home } from 'lucide-react'
import { useLocation, useMatches, useNavigate } from 'react-router-dom'
import { RouteHandle } from '@/router/router'

export const AppHeader = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const matches = useMatches()

	const isHome = location.pathname === '/' || location.pathname === '/home'

	// 从当前路由匹配中获取标题
	const currentTitle = matches.filter((match) => match.handle && typeof match.handle === 'object' && 'title' in match.handle).pop()?.handle as RouteHandle | undefined

	const title = currentTitle?.title || 'AI对话'

	return (
		<header className="flex-shrink-0 border-b bg-card px-4 py-3" data-slot="app-header">
			<div className="flex items-center justify-between w-full">
				{/* 左侧按钮区 */}
				<div className="flex items-center gap-2">
					{/* 返回按钮 */}
					<button onClick={() => navigate(-1)} className="flex items-center text-foreground hover:text-primary transition-colors cursor-pointer">
						<ArrowLeft className="square-5" />
					</button>

					{/* 首页按钮 */}
					<button
						onClick={() => navigate('/home')}
						disabled={isHome}
						className="flex items-center text-foreground hover:text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Home className="square-5" />
					</button>
				</div>

				{/* 中间标题 */}
				<div className="flex-1 text-center px-4">
					<h1 className="text-lg font-semibold">{title}</h1>
				</div>

				{/* 右侧操作区 */}
				<div className="flex items-center gap-3">
					<ThemeToggle />
					<MyAvatar size={32} onClick={() => navigate('/user')} />
				</div>
			</div>
		</header>
	)
}
