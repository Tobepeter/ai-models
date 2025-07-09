import { create } from 'zustand'

interface AppState {
	isLoading: boolean
	theme: 'light' | 'dark'
	user: {
		name: string
		email: string
	} | null
	setLoading: (loading: boolean) => void
	setTheme: (theme: 'light' | 'dark') => void
	setUser: (user: { name: string; email: string } | null) => void
}

export const useAppStore = create<AppState>((set) => ({
	isLoading: false,
	theme: 'light',
	user: null,
	setLoading: (loading) => set({ isLoading: loading }),
	setTheme: (theme) => set({ theme }),
	setUser: (user) => set({ user }),
}))
