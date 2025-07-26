import { JwtPayloadApp, jwt } from '@/utils/jwt'
import { storageKeys } from '@/utils/storage'
import { Nullable } from '@/utils/types'
import type { UserResponse } from '@/api/types/generated'
import { router } from '@/router/router'
import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'

const defaultUser: UserResponse = {
	id: 0,
	username: 'anonymous',
	email: 'anonymous@example.com',
	avatar: '',
	role: 'user',
	is_active: false,
	created_at: '',
	updated_at: '',
}

// 初始状态
const userState = {
	info: defaultUser,
	token: '',
	tokenPayload: null as Nullable<JwtPayloadApp>,
}

type UserState = typeof userState

const stateCreator = () => {
	return combine(userState, (set) => ({
		setData: (data: Partial<UserState>) => set(data),
		setToken: (token: string) => {
			if (!token) {
				set({ tokenPayload: null, token })
				return
			}

			const payload = jwt.parse(token)
			if (payload && jwt.isValid(payload)) {
				set({ tokenPayload: payload, token })
			}
		},
		clear: () => set(userState),
		/** 跳转到登录页，支持重定向参数 */
		goLogin: (redirectTo?: string) => {
			// 获取当前路径作为默认重定向地址
			const currentPath = redirectTo || window.location.pathname
			const loginUrl = currentPath === '/login' ? '/login' : `/login?redirect=${encodeURIComponent(currentPath)}`

			// 清空历史
			router.navigate(loginUrl, { replace: true })
		},
	}))
}

export const useUserStore = create(
	persist(stateCreator(), {
		name: storageKeys.user,
		partialize: (state) => ({
			info: state.info,
			token: state.token,
		}),
	})
)

export type UserStore = ReturnType<ReturnType<typeof stateCreator>>
