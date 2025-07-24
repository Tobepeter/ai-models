import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApiClient } from '@/utils/auth/auth-api-client'
import { AuthState, AuthUser, LoginRequest, RegisterRequest } from '@/types/auth-types'

interface AuthStore extends AuthState {
	// Actions
	login: (data: LoginRequest) => Promise<void>
	register: (data: RegisterRequest) => Promise<void>
	logout: () => void
	refreshProfile: () => Promise<void>
	setLoading: (loading: boolean) => void
	setError: (error: string | null) => void
	clearError: () => void
	initializeAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			// State
			isAuthenticated: false,
			user: null,
			token: null,
			isLoading: false,
			error: null,

			// Actions
			login: async (data: LoginRequest) => {
				set({ isLoading: true, error: null })
				try {
					const response = await authApiClient.login(data)
					set({
						isAuthenticated: true,
						user: response.user,
						token: response.token,
						isLoading: false,
						error: null,
					})
				} catch (error) {
					const errorMsg = error instanceof Error ? error.message : '登录失败'
					set({
						isAuthenticated: false,
						user: null,
						token: null,
						isLoading: false,
						error: errorMsg,
					})
					throw error
				}
			},

			register: async (data: RegisterRequest) => {
				set({ isLoading: true, error: null })
				try {
					const response = await authApiClient.register(data)
					set({
						isAuthenticated: true,
						user: response.user,
						token: response.token,
						isLoading: false,
						error: null,
					})
				} catch (error) {
					const errorMsg = error instanceof Error ? error.message : '注册失败'
					set({
						isAuthenticated: false,
						user: null,
						token: null,
						isLoading: false,
						error: errorMsg,
					})
					throw error
				}
			},

			logout: () => {
				authApiClient.logout()
				set({
					isAuthenticated: false,
					user: null,
					token: null,
					isLoading: false,
					error: null,
				})
			},

			refreshProfile: async () => {
				const { isAuthenticated } = get()
				if (!isAuthenticated) return

				set({ isLoading: true })
				try {
					const user = await authApiClient.getProfile()
					set({
						user,
						isLoading: false,
						error: null,
					})
				} catch (error) {
					const errorMsg = error instanceof Error ? error.message : '获取用户信息失败'
					set({
						isLoading: false,
						error: errorMsg,
					})
					// 如果获取用户信息失败，可能token已过期，执行登出
					if (error instanceof Error && error.message.includes('401')) {
						get().logout()
					}
				}
			},

			setLoading: (loading: boolean) => {
				set({ isLoading: loading })
			},

			setError: (error: string | null) => {
				set({ error })
			},

			clearError: () => {
				set({ error: null })
			},

			initializeAuth: () => {
				const isAuth = authApiClient.isAuthenticated()
				if (isAuth) {
					// 如果有token，尝试获取用户信息
					get().refreshProfile()
				} else {
					// 清除状态
					set({
						isAuthenticated: false,
						user: null,
						token: null,
					})
				}
			},
		}),
		{
			name: 'auth-storage',
			// 只持久化必要的状态，不包括loading和error
			partialize: (state) => ({
				isAuthenticated: state.isAuthenticated,
				user: state.user,
				token: state.token,
			}),
		}
	)
)
