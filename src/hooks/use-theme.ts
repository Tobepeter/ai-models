import { useAppStore } from '@/store/store'
import { useMount } from 'ahooks'
import { useEffect } from 'react'

export const useTheme = () => {
	const { theme, getComputedTheme } = useAppStore()

	useMount(() => {
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
