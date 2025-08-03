import { router } from '@/router/router'
import { JwtPayloadApp, jwt } from '@/utils/jwt'
import { storageKeys } from '@/utils/storage'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import type { UserResponse } from '@/api/swagger/generated'

export const userState = {
	info: {
		id: '',
		username: 'anonymous',
		email: 'anonymous@example.com',
		avatar: '',
		avatar_oss_key: '',
		role: 'user',
		is_active: false,
		created_at: '',
		updated_at: '',
	} as UserResponse,
	token: '',
	refreshToken: '',
	tokenPayload: null as Nullable<JwtPayloadApp>,
	refreshTokenPayload: null as Nullable<JwtPayloadApp>,
}

type UserState = typeof userState

// Persist data to localStorage
const persistData = (state: UserState) => {
	try {
		const dataToPersist = {
			info: state.info,
			token: state.token,
			refreshToken: state.refreshToken,
		}
		localStorage.setItem(storageKeys.user, JSON.stringify(dataToPersist))
	} catch (error) {
		console.warn('[UserStore] Failed to persist data:', error)
	}
}

// Create the store state
const stateCreator = () => {
	return combine(userState, (set, get) => ({
		// Set partial user state data
		setData: (data: Partial<UserState>) => {
			const newState = { ...get(), ...data }

			// If token is being set, also update tokenPayload
			if (data.token !== undefined) {
				if (!data.token) {
					newState.tokenPayload = null
				} else {
					const payload = jwt.parse(data.token)
					if (payload && jwt.isValid(payload)) {
						newState.tokenPayload = payload
					}
				}
			}

			// If refreshToken is being set, also update refreshTokenPayload
			if (data.refreshToken !== undefined) {
				if (!data.refreshToken) {
					newState.refreshTokenPayload = null
				} else {
					const payload = jwt.parse(data.refreshToken)
					if (payload && jwt.isValid(payload)) {
						newState.refreshTokenPayload = payload
					}
				}
			}

			// 如果清空token，同时清空refreshToken
			if (data.token === '') {
				newState.refreshToken = ''
				newState.refreshTokenPayload = null
			}

			set(newState)
			// Trigger persistence
			persistData(newState)
		},
		// Clear user data
		clear: () => {
			set(userState)
			localStorage.removeItem(storageKeys.user)
		},
		goLogin: (redirectTo?: string) => {
			// Get current path as default redirect address
			const currentPath = redirectTo || window.location.pathname
			const loginUrl = currentPath === '/login' ? '/login' : `/login?redirect=${encodeURIComponent(currentPath)}`

			// Clear history
			router.navigate(loginUrl, { replace: true })
		},
		// Restore persisted data and parse token payload
		restore: () => {
			try {
				const persistedData = localStorage.getItem(storageKeys.user)
				if (persistedData) {
					const parsed = JSON.parse(persistedData)
					const restored = {
						...userState,
						...parsed,
					}

					// Parse token payload if token exists
					if (restored.token) {
						const payload = jwt.parse(restored.token)
						if (payload && jwt.isValid(payload)) {
							restored.tokenPayload = payload
						}
					}

					// Parse refreshToken payload if refreshToken exists
					if (restored.refreshToken) {
						const payload = jwt.parse(restored.refreshToken)
						if (payload && jwt.isValid(payload)) {
							restored.refreshTokenPayload = payload
						}
					}

					set(restored)
					return
				}
			} catch (error) {
				console.warn('[UserStore] Failed to restore persisted data:', error)
			}
			// Fallback to default state
			set(userState)
		},
		// Manually trigger persistence
		persist: () => {
			persistData(get())
		},
		// 处理登录响应，自动设置token和refreshToken
		handleAuthResponse: (authData: { user: UserResponse; token: string; refresh_token?: string }) => {
			const newState = {
				info: authData.user,
				token: authData.token,
				refreshToken: authData.refresh_token || '', // 设置refreshToken，如果没有则为空
				tokenPayload: null as Nullable<JwtPayloadApp>,
				refreshTokenPayload: null as Nullable<JwtPayloadApp>,
			}

			// 解析token payload
			const payload = jwt.parse(authData.token)
			if (payload && jwt.isValid(payload)) {
				newState.tokenPayload = payload
			}

			// 解析refreshToken payload
			if (authData.refresh_token) {
				const refreshPayload = jwt.parse(authData.refresh_token)
				if (refreshPayload && jwt.isValid(refreshPayload)) {
					newState.refreshTokenPayload = refreshPayload
				}
			}

			set(newState)
			persistData(newState)
		},
	}))
}

export const useUserStore = create(stateCreator())

export type UserStore = ReturnType<ReturnType<typeof stateCreator>>
