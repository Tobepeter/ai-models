import { useMount } from 'ahooks'
import { Outlet, useNavigate } from 'react-router-dom'
import debug from './utils/debug'
import { isDev, isMock, isProd } from './utils/env'
import { useGitHubPagesRouter } from './hooks/useGitHubPagesRouter'

function App() {
	const navigate = useNavigate()
	useGitHubPagesRouter() // GitHub Pages SPA 路由恢复

	useMount(() => {
		console.log(`%c[App] isDev: ${isDev}, isMock: ${isMock}`, 'color: white; background: black; border-radius: 5px; padding: 5px;')
		if (isDev) debug.init()

		// auto nagivat to chat
		if (isProd) {
			navigate('/chat')
		}
	})

	return (
		<div className="bg-background text-foreground">
			<Outlet />
		</div>
	)
}

export default App
