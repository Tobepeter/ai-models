import { UserResp } from '@/api/types/user-types'
import { authApi } from '@/api/auth'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserStore {
	// Auth相关状态
	isAuthenticated: boolean
	user: UserResp | null
	token: string | null
	authError: string | null
	isLoading: boolean

	// Auth Actions
	setAuth: (user: UserResp, token: string) => void
	clearAuth: () => void
	setAuthError: (error: string | null) => void
	initializeAuth: () => void
	setLoading: (loading: boolean) => void
	logout: () => void
}

export const useUserStore = create<UserStore>()(
	persist(
		(set, get) => ({
			// Auth状态
			isAuthenticated: false,
			user: null,
			token: null,
			authError: null,
			isLoading: false,

			// Auth Actions
			setAuth: (user, token) => {
				set({
					isAuthenticated: true,
					user,
					token,
					authError: null,
				})
			},

			clearAuth: () => {
				set({
					isAuthenticated: false,
					user: null,
					token: null,
					authError: null,
				})
			},

			setAuthError: (error) => {
				set({ authError: error })
			},

			initializeAuth: () => {
				const token = localStorage.getItem('auth_token')
				if (token) {
					// 这里可以触发获取用户信息的逻辑
					set({ token, isAuthenticated: true })
				} else {
					get().clearAuth()
				}
			},

			setLoading: (loading) => {
				set({ isLoading: loading })
			},

			logout: () => {
				authApi.logout()
				// 清理auth状态
				get().clearAuth()
				// 重置加载状态
				set({ isLoading: false })
			},
		}),
		{
			name: 'user-storage',
			// 只持久化必要的状态
			partialize: (state) => ({
				isAuthenticated: state.isAuthenticated,
				user: state.user,
				token: state.token,
			}),
		}
	)
)
