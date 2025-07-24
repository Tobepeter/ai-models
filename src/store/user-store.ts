import { dummy } from '@/utils/dummy'
import { UserProfile, UserSettings } from '@/types/user-types'
import { AuthUser } from '@/api/types/auth-types'
import { authApi } from '@/api/auth'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserStore {
	// Auth相关状态
	isAuthenticated: boolean
	user: AuthUser | null
	token: string | null
	authError: string | null

	// 用户数据
	profile: UserProfile
	settings: UserSettings
	isLoading: boolean

	// Auth Actions
	setAuth: (user: AuthUser, token: string) => void
	clearAuth: () => void
	setAuthError: (error: string | null) => void
	initializeAuth: () => void

	// User Actions
	updateProfile: (updates: Partial<UserProfile>) => void
	updateSettings: (updates: Partial<UserSettings>) => void
	setLoading: (loading: boolean) => void
	logout: () => void
}

// 默认用户数据
const defaultProfile: UserProfile = {
	id: 'demo-user-001',
	name: '演示用户',
	email: 'demo@example.com',
	avatar: dummy.avatar,
	joinDate: '2024-01-01',
	lastLoginDate: new Date().toISOString().split('T')[0],
	isOnline: true,
}

const defaultSettings: UserSettings = {
	theme: 'system',
	language: 'zh-CN',
	notifications: true,
	autoSave: true,
	streamingEnabled: true,
}

export const useUserStore = create<UserStore>()(
	persist(
		(set, get) => ({
			// Auth状态
			isAuthenticated: false,
			user: null,
			token: null,
			authError: null,

			// 用户数据
			profile: defaultProfile,
			settings: defaultSettings,
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
				const isAuth = authApi.isAuthenticated()
				if (isAuth) {
					// 这里可以触发获取用户信息的逻辑
					const token = localStorage.getItem('auth_token')
					if (token) {
						set({ token, isAuthenticated: true })
					}
				} else {
					get().clearAuth()
				}
			},

			// User Actions
			updateProfile: (updates) => {
				set((state) => ({
					profile: { ...state.profile, ...updates },
				}))
			},

			updateSettings: (updates) => {
				set((state) => ({
					settings: { ...state.settings, ...updates },
				}))
			},

			setLoading: (loading) => {
				set({ isLoading: loading })
			},

			logout: () => {
				authApi.logout()
				// 清理auth状态
				get().clearAuth()
				// 重置用户数据为默认状态
				set({
					profile: defaultProfile,
					settings: defaultSettings,
					isLoading: false,
				})
			},
		}),
		{
			name: 'user-storage',
			// 只持久化必要的状态
			partialize: (state) => ({
				isAuthenticated: state.isAuthenticated,
				user: state.user,
				token: state.token,
				profile: state.profile,
				settings: state.settings,
			}),
		}
	)
)
