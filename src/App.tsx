import { useMount } from 'ahooks'
import { Outlet, useNavigate } from 'react-router-dom'
import { authApi } from './api/auth/auth-api'
import { NotifyHub } from './components/common/notify'
import { useGitHubPagesRouter } from './hooks/useGitHubPagesRouter'
import debug from './utils/debug'
import { buildTimeLocal, isDev, isMock, isProd } from './utils/env'

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

		// 静默登录状态
		authApi.checkLogin()

		if (isProd) {
			navigate('/chat')
		}
	})

	return (
		<div className="bg-background text-foreground">
			<Outlet />
			<NotifyHub />
			{/* {isDev && <GM />} */}
		</div>
	)
}

export default App
