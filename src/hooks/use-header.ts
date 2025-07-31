import { ReactNode } from 'react'
import { useUnmount } from 'ahooks'
import { useHeaderStore } from '@/store/header-store'

/**
 * Header便利hook - 自动处理unmount时重置
 */
export const useHeader = () => {
	const { setTitle, reset } = useHeaderStore()

	// 组件卸载时自动重置为路由标题
	useUnmount(() => {
		reset()
	})

	return {
		setTitle: (title: ReactNode) => setTitle(title),
	}
}
