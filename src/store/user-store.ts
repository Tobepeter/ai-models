import { router } from '@/router/router'
import { JwtPayloadApp, jwt } from '@/utils/jwt'
import { storageKeys } from '@/utils/storage'
import { Nullable } from '@/utils/types'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import type { UserResponse } from '@/api/swagger/generated'

// Initial user state
const userState = {
	info: {
		id: 0,
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
	tokenPayload: null as Nullable<JwtPayloadApp>,
}

type UserState = typeof userState

// Persist data to localStorage
const persistData = (state: UserState) => {
	try {
		const dataToPersist = {
			info: state.info,
			token: state.token,
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
			
			set(newState)
			// Trigger persistence
			persistData(newState)
		},
		// Clear user data
		clear: () => {
			set(userState)
			// Also clear persisted data
			localStorage.removeItem(storageKeys.user)
		},
		// Navigate to login page with optional redirect
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
	}))
}

export const useUserStore = create(stateCreator())

export type UserStore = ReturnType<ReturnType<typeof stateCreator>>
