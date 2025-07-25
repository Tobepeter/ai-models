import { useMount } from 'ahooks'
import { Outlet, useNavigate } from 'react-router-dom'
import { useGitHubPagesRouter } from './hooks/useGitHubPagesRouter'
import debug from './utils/debug'
import { buildTimeLocal, isDev, isMock, isProd } from './utils/env'
import { NotifyHub } from './components/common/notify'

function App() {
	const navigate = useNavigate()
	useGitHubPagesRouter()

	useMount(() => {
		let msg = ''
		if (isDev) {
			debug.init()
			msg += `isMock ${isMock}`
		} else {
			msg += `buildTimeLocal: ${buildTimeLocal}`
		}
		console.log(`%c[App] ${msg}`, 'color: white; background: black; border-radius: 5px; padding: 5px;')

		if (isProd) {
			navigate('/chat')
		}
	})

	return (
		<div className="bg-background text-foreground">
			<Outlet />
			<NotifyHub />
		</div>
	)
}

export default App
