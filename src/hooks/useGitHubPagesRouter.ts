import { useMount } from 'ahooks'
import { useNavigate } from 'react-router-dom'

/**
 * 解决 GitHub Pages SPA
 * 可以参考 public/404.html
 */
export function useGitHubPagesRouter() {
	const navigate = useNavigate()

	useMount(() => {
		const redirect = sessionStorage.getItem('spa-redirect')

		if (redirect) {
			sessionStorage.removeItem('spa-redirect')

			let targetPath = redirect

			// 确保路径以 / 开头
			if (!targetPath.startsWith('/')) {
				targetPath = '/' + targetPath
			}

			// 如果目标路径就是根路径，不需要导航
			if (targetPath === '/') {
				return
			}

			navigate(targetPath, { replace: true })
		}
	})
}
