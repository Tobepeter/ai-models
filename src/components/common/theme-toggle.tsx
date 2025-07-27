import { Switch } from '@/components/ui/switch'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

/**
 * 主题切换开关组件
 *
 * 智能切换，会尝试同步回系统偏好
 */
export const ThemeToggle = () => {
	const { setTheme, resolvedTheme, systemTheme } = useTheme()
	const isDark = resolvedTheme === 'dark'
	const isMounted = useRef(false)

	const changeTheme = (theme: string) => {
		// 如果要设置的主题和系统偏好一致，改为system
		if (theme === systemTheme) {
			setTheme('system')
		} else {
			setTheme(theme)
		}
	}

	const handleToggle = (checked: boolean) => {
		const targetTheme = checked ? 'dark' : 'light'
		changeTheme(targetTheme)
	}

	// 系统变化自动设置对一个的解析主题（让内部尽量对齐是系统默认）
	useEffect(() => {
		// 跳过第一次自动设置
		if (!isMounted.current) {
			isMounted.current = true
			return
		}
		changeTheme(resolvedTheme)
	}, [resolvedTheme, systemTheme])

	return (
		<div className="flex items-center gap-2">
			<Switch checked={isDark} onCheckedChange={handleToggle} className="data-[state=checked]:bg-slate-800 data-[state=unchecked]:bg-slate-200" />
			{isDark ? <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" /> : <Sun className="h-4 w-4 text-yellow-500" />}
		</div>
	)
}
