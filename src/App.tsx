import { useMount } from 'ahooks'
import { Outlet, useNavigate } from 'react-router-dom'
import { useGitHubPagesRouter } from './hooks/useGitHubPagesRouter'
import debug from './utils/debug'
import { buildTimeLocal, isDev, isMock, isProd } from './utils/env'

function App() {
	const navigate = useNavigate()
	useGitHubPagesRouter() // GitHub Pages SPA 路由恢复

	useMount(() => {
		let msg = ''
		if (isDev) {
			debug.init()
			msg += `isMock ${isMock}`
		} else {
			msg += `buildTimeLocal: ${buildTimeLocal}`
		}
		console.log(`%c[App] ${msg}`, 'color: white; background: black; border-radius: 5px; padding: 5px;')

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
