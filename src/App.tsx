import { useMount } from 'ahooks'
import { Outlet } from 'react-router-dom'
import { isDev, isMock } from './utils/env'
import debug from './utils/debug'

function App() {
	useMount(() => {
		// 黑色背景，圆角白色字
		console.log(`%c[App] isDev: ${isDev}, isMock: ${isMock}`, 'color: white; background: black; border-radius: 5px; padding: 5px;')
		if (isDev) debug.init()
	})

	return (
		<div className="min-h-screen bg-background text-foreground">
			<Outlet />
		</div>
	)
}

export default App
