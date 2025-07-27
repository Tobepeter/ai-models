import { useUserStore } from '@/store/user-store'
import { jwt } from '@/utils/jwt'
import { api } from '../api'
import type { ChangePasswordRequest, LoginData, UserCreateRequest, UserLoginRequest } from '../types/generated'
import { userApi } from '../user/user-api'

class AuthApi {
	async login(data: UserLoginRequest) {
		const res = await api.users.login(data)
		if (!res) return null
		const authData = res.data as LoginData
		const store = useUserStore.getState()
		const { token, user } = authData
		if (token) store.setToken(token)
		if (user) store.setData({ info: user })
		return authData
	}

	async register(data: UserCreateRequest) {
		const res = await api.users.registerCreate(data)
		if (!res) return null
		const authData = res.data
		const store = useUserStore.getState()
		const { token, user } = authData
		if (token) store.setToken(token)
		if (user) store.setData({ info: user })
		return authData
	}

	/** 退出登录 */
	async logout() {
		try {
			await api.users.logoutCreate()
		} catch (e) {
			console.error('Logout API call failed:', e)
		} finally {
			// 直接清除 store
			useUserStore.getState().clear()
		}
		return { success: true }
	}

	// 检查登录信息是否有效，并且静默刷新用户信息
	async checkLogin() {
		const store = useUserStore.getState()
		const { token, tokenPayload } = store

		// 没有token
		if (!token) return false

		// token过期
		if (!tokenPayload || !jwt.isValid(tokenPayload)) {
			store.clear()
			return false
		}

		// token有效，静默刷新用户信息
		const userInfo = await userApi.getProfile()
		if (!userInfo) {
			store.clear()
			return false
		}
		return true
	}
}

export const authApi = new AuthApi()
