import { storageKeys } from '@/utils/storage'
import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'

// 使用 combine 最佳实践：无需手写interface，完全类型推断
const appState = {
	isLoading: false,
}

type AppState = typeof appState

const stateCreator = () => {
	return combine(appState, (set, get) => ({
		setData: (data: Partial<AppState>) => set(data),
		setLoading: (loading: boolean) => set({ isLoading: loading }),
	}))
}

export const useAppStore = create(
	persist(stateCreator(), {
		name: storageKeys.app,
		partialize: (state) => ({
			// 不再需要持久化主题，next-themes 会自动处理
		}),
	})
)

export type AppStore = ReturnType<typeof useAppStore>
