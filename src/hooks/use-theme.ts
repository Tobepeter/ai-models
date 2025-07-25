import { useAppStore } from '@/store/app-store'
import { useMount } from 'ahooks'
import { useEffect } from 'react'

export const useTheme = () => {
	const { computedTheme, updateTheme } = useAppStore()

	// 监听系统主题
	useMount(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handleChange = () => {
			updateTheme()
		}
		mediaQuery.addEventListener('change', handleChange)
		return () => {
			mediaQuery.removeEventListener('change', handleChange)
		}
	})

	// 响应ui变化
	useEffect(() => {
		const root = document.documentElement
		if (computedTheme === 'dark') {
			root.classList.add('dark')
		} else {
			root.classList.remove('dark')
		}
	}, [computedTheme])
}
