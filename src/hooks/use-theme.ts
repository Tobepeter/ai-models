import { useAppStore } from '@/store/store'
import { storage } from '@/utils/storage'
import { useMount } from 'ahooks'
import { useEffect } from 'react'

export const useTheme = () => {
	const { theme, getComputedTheme, setTheme } = useAppStore()

	useMount(() => {
		// 从存储恢复主题
		const appData = storage.getAppData()
		if (appData.theme) {
			setTheme(appData.theme)
		}

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		mediaQuery.addEventListener('change', updateTheme)
		return () => {
			mediaQuery.removeEventListener('change', updateTheme)
		}
	})

	const updateTheme = () => {
		const computedTheme = getComputedTheme()
		const root = document.documentElement
		if (computedTheme === 'dark') {
			root.classList.add('dark')
		} else {
			root.classList.remove('dark')
		}
	}

	useEffect(() => {
		updateTheme()
	}, [theme])
}
