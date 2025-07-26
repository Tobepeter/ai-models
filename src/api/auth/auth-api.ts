import { useUserStore } from '@/store/user-store'
import { jwt } from '@/utils/jwt'
import { api } from '../api'
import type {
	ChangePasswordRequest,
	UserCreateRequest,
	UserLoginRequest,
	UserResponse
} from '../types/generated'
import { userApi } from '../user/user-api'


/** 认证相关API */
class AuthApi {
	/** 登录 */
	async login(data: UserLoginRequest) {
		const res = await api.users.loginCreate(data)
		if (!res) return null

		const authData = res.data

		// 直接设置 store
		if (authData.token) {
			useUserStore.getState().setToken(authData.token)
		}
		if (authData.user) {
			useUserStore.getState().setData({ info: authData.user as UserResponse })
		}

		return authData
	}

	/** 注册 */
	async register(data: UserCreateRequest) {
		const res = await api.users.registerCreate(data)
		if (!res) return null

		const authData = res.data

		// 直接设置 store
		if (authData.token) {
			useUserStore.getState().setToken(authData.token)
		}
		if (authData.user) {
			useUserStore.getState().setData({ info: authData.user as UserResponse })
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

	// 检查登录信息是否有效，并且静默刷新用户信息
	async checkLogin() {
		try {
			const { token, tokenPayload } = useUserStore.getState()

			// 没有token，直接返回未登录
			if (!token) return { isLoggedIn: false }

			// token过期，清除并返回未登录
			if (!tokenPayload || !jwt.isValid(tokenPayload)) {
				useUserStore.getState().clear()
				return { isLoggedIn: false }
			}

			// token有效，静默刷新用户信息
			try {
				const userInfo = await this.refreshUserInfo()
				if (userInfo) {
					return { isLoggedIn: true, user: userInfo }
				} else {
					// 刷新失败，可能token已失效，清除状态
					useUserStore.getState().clear()
					return { isLoggedIn: false }
				}
			} catch (error) {
				// 刷新失败，可能token已失效，清除状态
				useUserStore.getState().clear()
				return { isLoggedIn: false }
			}
		} catch (error) {
			// 静默处理所有错误，不显示notify
			console.warn('checkLogin failed:', error)
			return { isLoggedIn: false }
		}
	}

	/** 静默刷新用户信息到store */
	async refreshUserInfo() {
		try {
			const userInfo = await userApi.getProfile()
			useUserStore.getState().setData({ info: userInfo })
			return userInfo
		} catch (error) {
			console.warn('刷新用户信息失败:', error)
			return null
		}
	}

	/** 获取用户信息 */
	async getProfile() {
		const res = await api.users.profileList()
		if (res.data.code !== 0) throw new Error(res.data.message || '获取用户信息失败')
		return res.data.data!
	}

	/** 修改密码 */
	async changePassword(data: { oldPassword: string; newPassword: string; confirmPassword: string }) {
		const req: ChangePasswordRequest = {
			old_password: data.oldPassword,
			new_password: data.newPassword
		}
		const res = await api.users.changePasswordCreate(req)
		if (res.data.code !== 0) throw new Error(res.data.message || '修改密码失败')
		return res.data
	}
}

export const authApi = new AuthApi()
