import { useMount } from 'ahooks'
import { Outlet, useNavigate } from 'react-router-dom'
import { useGitHubPagesRouter } from './hooks/useGitHubPagesRouter'
import { useUserStore } from './store/user-store'
import debug from './utils/debug'
import { buildTimeLocal, isDev, isMock, isProd } from './utils/env'

function App() {
	const navigate = useNavigate()
	// const { initializeAuth } = useUserStore()
	useGitHubPagesRouter()

	useMount(() => {
		// initializeAuth()

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
