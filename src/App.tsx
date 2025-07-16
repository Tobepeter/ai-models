import { useMount } from 'ahooks'
import { Outlet, useNavigate } from 'react-router-dom'
import debug from './utils/debug'
import { isDev, isMock, isProd } from './utils/env'

function App() {
	const navigate = useNavigate()
	useMount(() => {
		console.log(`%c[App] isDev: ${isDev}, isMock: ${isMock}
			`, 'color: white; background: black; border-radius: 5px; padding: 5px;')
		if (isDev) debug.init()

		// auto nagivat to chat
		if (isProd) {
			navigate('/chat')
		}
	})

	// 测试dvh
	
	return (
		<div className="bg-background text-foreground">
			<Outlet />
		</div>
	)
}

export default App
