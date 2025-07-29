import { useMount } from 'ahooks'
import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { authApi } from './api/auth/auth-api'
import { NotifyHub } from './components/common/notify'
import { useGitHubPagesRouter } from './hooks/useGitHubPagesRouter'
import { useUserStore } from './store/user-store'
import debug from './utils/debug'
import { buildTimeLocal, isDev, isMock, isProd } from './utils/env'
import { zodUtil } from './utils/zod-util'

function App() {
	const navigate = useNavigate()
	const userStore = useUserStore()
	const [isMounted, setIsMounted] = useState(false)
	useGitHubPagesRouter()

	useMount(async () => {
		// 初始化 zod 中文错误消息
		await zodUtil.init()

		let msg = ''
		if (isDev) {
			debug.init()
			msg += `isMock ${isMock}`
		} else {
			msg += `buildTimeLocal: ${buildTimeLocal}`
		}
		console.log(`%c[App] ${msg}`, 'color: white; background: black; border-radius: 5px; padding: 5px;')

		userStore.restore() // 恢复用户存储数据
		authApi.checkLogin() // 静默登录状态

		if (isProd) {
			navigate('/chat')
		}

		setIsMounted(true)
	})

	// 确保 storage 已经加载初始化代码执行了
	if (!isMounted) {
		return null
	}

	return (
		<div className="bg-background text-foreground">
			<Outlet />
			<NotifyHub />
			{/* {isDev && <GM />} */}
		</div>
	)
}

export default App
