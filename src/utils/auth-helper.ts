import { api } from '@/api/api'
import { useUserStore } from '@/store/user-store'
import type { UserLoginRequest, UserCreateRequest } from '@/api/swagger/generated'

/**
 * 认证辅助工具类
 * 提供登录、注册、刷新token等功能，自动处理refreshToken
 */
export class AuthHelper {
	/**
	 * 用户登录
	 * 自动处理token和refreshToken的存储
	 */
	static async login(credentials: UserLoginRequest) {
		const response = await api.users.login(credentials)
		if (response?.data) {
			// 使用新的handleAuthResponse方法自动处理token和refreshToken
			useUserStore.getState().handleAuthResponse(response.data)
			return response.data
		}
		return null
	}

	/**
	 * 用户注册
	 * 自动处理token和refreshToken的存储
	 */
	static async register(userData: UserCreateRequest) {
		const response = await api.users.register(userData)
		if (response?.data) {
			// 使用新的handleAuthResponse方法自动处理token和refreshToken
			useUserStore.getState().handleAuthResponse(response.data)
			return response.data
		}
		return null
	}

	/**
	 * 手动刷新token
	 * 通常由API拦截器自动调用，也可以手动调用
	 */
	static async refreshToken() {
		const response = await api.users.refreshToken()
		if (response?.data?.token) {
			const updateData: { token: string; refreshToken?: string } = { 
				token: response.data.token 
			}
			if (response.data.refresh_token) {
				updateData.refreshToken = response.data.refresh_token
			}
			useUserStore.getState().setData(updateData)
			return response.data
		}
		return null
	}

	/**
	 * 退出登录
	 * 清除本地存储的token和refreshToken
	 */
	static async logout() {
		try {
			await api.users.logout()
		} catch (error) {
			console.warn('[AuthHelper] Logout API call failed:', error)
		} finally {
			// 无论API调用是否成功，都清除本地数据
			useUserStore.getState().clear()
		}
	}

	/**
	 * 检查用户是否已登录
	 */
	static isLoggedIn(): boolean {
		const { token } = useUserStore.getState()
		return !!token
	}

	/**
	 * 获取当前用户信息
	 */
	static getCurrentUser() {
		const { info } = useUserStore.getState()
		return info
	}
}
