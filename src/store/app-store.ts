import { storageKeys } from '@/utils/storage'
import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'
export type ComputedTheme = Omit<Theme, 'system'>

// 使用 combine 最佳实践：无需手写interface，完全类型推断
const appState = {
	isLoading: false,
	theme: 'system' as Theme,
	computedTheme: 'light' as ComputedTheme,
}

type AppState = typeof appState

const stateCreator = () => {
	return combine(appState, (set, get) => ({
		setData: (data: Partial<AppState>) => set(data),
		setLoading: (loading: boolean) => set({ isLoading: loading }),

		setTheme: (theme: Theme) => {
			// NOTE: get 这里类型推断只能拿到 baseState 的类型，其实是能拿到方法的
			const store = get() as AppStore
			const computedTheme = store.getComputedTheme(theme)
			set({ theme, computedTheme })
		},

		updateTheme: () => {
			const { theme, setTheme } = get() as AppStore
			setTheme(theme)
		},

		getComputedTheme: (theme: Theme): ComputedTheme => {
			if (theme === 'system') {
				const query = window.matchMedia('(prefers-color-scheme: dark)')
				return query.matches ? 'dark' : 'light'
			}
			return theme
		},
	}))
}

export const useAppStore = create(
	persist(stateCreator(), {
		name: storageKeys.app,
		partialize: (state) => ({
			theme: state.theme,
		}),
		onRehydrateStorage: () => (state) => {
			if (state) {
				state.setTheme(state.theme)
			}
		},
	})
)

export type AppStore = ReturnType<ReturnType<typeof stateCreator>>
