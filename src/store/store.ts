import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'
export type ComputedTheme = Omit<Theme, 'system'>

export interface AppStore {
	isLoading: boolean
	theme: Theme
	setLoading: (loading: boolean) => void
	setTheme: (theme: Theme) => void
	getComputedTheme: () => ComputedTheme
}

export const useAppStore = create<AppStore>()((set, get) => ({
	isLoading: false,
	theme: 'system',
	setLoading: (loading) => set({ isLoading: loading }),
	setTheme: (theme) => set({ theme }),
	getComputedTheme: () => {
		const { theme } = get()
		if (theme === 'system') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
		}
		return theme
	},
}))
