import { useMount } from 'ahooks'
import { useNavigate } from 'react-router-dom'

/**
 * 解决 GitHub Pages SPA
 *
 * 通过 404.html 保存路径并重定向首页，
 * React 启动时恢复原始路由。
 */
export function useGitHubPagesRouter() {
	const navigate = useNavigate()

	useMount(() => {
		const redirect = sessionStorage.getItem('spa-redirect')

		if (redirect) {
			sessionStorage.removeItem('spa-redirect')

			const base = import.meta.env.BASE_URL || '/'
			let targetPath = redirect

			// 移除 base path 前缀（如果存在）
			if (base !== '/' && redirect.startsWith(base)) {
				targetPath = redirect.slice(base.length - 1)
			}

			// 确保路径以 / 开头
			if (!targetPath.startsWith('/')) {
				targetPath = '/' + targetPath
			}

			console.log('GitHub Pages 路由恢复:', redirect, '->', targetPath)

			// 使用 React Router 导航到目标路径
			navigate(targetPath, { replace: true })
		}
	})
}
