import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { useUserStore } from '@/store/user-store'
import { Home } from 'lucide-react'
import { useLocation, useMatches, useNavigate } from 'react-router-dom'
import { RouteHandle } from '@/router/router'

export const AppHeader = () => {
	const { info: user } = useUserStore()
	const navigate = useNavigate()
	const location = useLocation()
	const matches = useMatches()

	const isHome = location.pathname === '/' || location.pathname === '/home'

	// 从当前路由匹配中获取标题
	const currentTitle = matches
		.filter(match => match.handle && typeof match.handle === 'object' && 'title' in match.handle)
		.pop()?.handle as RouteHandle | undefined

	const title = currentTitle?.title || 'AI对话'

	return (
		<header className="flex-shrink-0 border-b bg-card px-4 py-3">
			<div className="flex items-center justify-between w-full">
				{/* 左侧 Home */}
				<button
					onClick={() => navigate('/home')}
					disabled={isHome}
					className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<Home className="h-5 w-5" />
					<span className="font-medium hidden sm:inline">首页</span>
				</button>

				{/* 中间标题 */}
				<div className="flex-1 text-center px-4">
					<h1 className="text-lg font-semibold">{title}</h1>
				</div>

				{/* 右侧操作区 */}
				<div className="flex items-center gap-3">
					<ThemeToggle />
					<button onClick={() => navigate('/user')} className="flex items-center">
						<Avatar className="h-8 w-8">
							<AvatarImage src={user?.avatar} alt={user?.username} />
							<AvatarFallback>{user?.username?.charAt(0) || 'U'}</AvatarFallback>
						</Avatar>
					</button>
				</div>
			</div>
		</header>
	)
}
