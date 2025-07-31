import { ThemeToggle } from '@/components/common/theme-toggle'
import { MyAvatar } from '@/pages/user/components/my-avatar'
import { ArrowLeft, Home } from 'lucide-react'
import { useLocation, useMatches, useNavigate } from 'react-router-dom'
import { RouteHandle } from '@/router/router'
import { useHeaderStore } from '@/store/header-store'
import { useEffect } from 'react'

export const AppHeader = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const matches = useMatches()
	const isHome = location.pathname === '/' || location.pathname === '/home'
	const { title } = useHeaderStore()

	const getRouteTitle = () => {
		let result = ''
		for (let i = 0; i < matches.length; i++) {
			const match = matches[i]
			const handle = match.handle as RouteHandle | undefined
			if (handle && 'title' in handle) {
				result = handle.title
				break
			}
		}
		return result
	}

	const finalTitle = title || getRouteTitle()

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
				<div className="flex gap-4 items-center">
					<h1 className="text-lg font-semibold">{finalTitle}</h1>
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
