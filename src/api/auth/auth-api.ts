import { api } from '../api'
import { useUserStore } from '@/store/user-store'
import {
	ModelsUserLoginRequest,
	ModelsUserCreateRequest,
	ModelsUserResponse,
	ModelsChangePasswordRequest
} from '../types/generated'

/** 认证相关API */
class AuthApi {
	/** 登录 */
	async login(data: ModelsUserLoginRequest) {
		const res = await api.users.loginCreate(data)
		if (res.data.code !== 200) throw new Error(res.data.message || '登录失败')
		const authData = res.data.data!

		// 直接设置 store
		if (authData.token) {
			useUserStore.getState().setToken(authData.token)
		}
		if (authData.user) {
			useUserStore.getState().setData({ info: authData.user as ModelsUserResponse })
		}

		return authData
	}

	/** 注册 */
	async register(data: ModelsUserCreateRequest) {
		const res = await api.users.registerCreate(data)
		if (res.data.code !== 200) throw new Error(res.data.message || '注册失败')
		const authData = res.data.data!

		// 直接设置 store
		if (authData.token) {
			useUserStore.getState().setToken(authData.token)
		}
		if (authData.user) {
			useUserStore.getState().setData({ info: authData.user as ModelsUserResponse })
		}

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

	/** 获取用户信息 */
	async getProfile() {
		const res = await api.users.profileList()
		if (res.data.code !== 200) throw new Error(res.data.message || '获取用户信息失败')
		return res.data.data!
	}

	/** 修改密码 */
	async changePassword(data: { oldPassword: string; newPassword: string; confirmPassword: string }) {
		const req: ModelsChangePasswordRequest = {
			old_password: data.oldPassword,
			new_password: data.newPassword
		}
		const res = await api.users.changePasswordCreate(req)
		if (res.data.code !== 200) throw new Error(res.data.message || '修改密码失败')
		return res.data
	}
}

export const authApi = new AuthApi()
