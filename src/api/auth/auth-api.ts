import { axClient } from '../ax-client'
import { AuthLoginReq, AuthRegisterReq, AuthLoginResp, AuthRegisterResp, AuthChangePasswordReq } from '../types/auth-types'
import { UserResp } from '../types/user-types'
import { ApiResponse } from '../common'

/** 认证相关API类 */
class AuthApi {
	// 登录
	async login(data: AuthLoginReq) {
		const response = await axClient.post<ApiResponse<AuthLoginResp>>('/users/login', data)
		if (response.data.code !== 200) throw new Error(response.data.msg || '登录失败')
		const result = response.data.data!

		// 更新axClient的token
		axClient.token = result.token
		localStorage.setItem('auth_token', result.token)
		return result
	}

	// 注册
	async register(data: AuthRegisterReq) {
		const response = await axClient.post<ApiResponse<AuthRegisterResp>>('/users/register', {
			username: data.username,
			email: data.email,
			password: data.password,
		})
		if (response.data.code !== 200) throw new Error(response.data.msg || '注册失败')
		const result = response.data.data!

		// 更新axClient的token
		axClient.token = result.token
		localStorage.setItem('auth_token', result.token)
		return result
	}

	// 退出登录
	async logout() {
		try {
			// 调用后端logout接口
			await axClient.post('/users/logout')
		} catch (error) {
			console.error('Logout API call failed:', error)
		} finally {
			// 即使后端调用失败，也要清除本地token
			axClient.clearToken()
		}
		return { success: true }
	}

	// 获取用户信息
	async getProfile() {
		const response = await axClient.get<ApiResponse<UserResp>>('/users/profile')
		if (response.data.code !== 200) throw new Error(response.data.msg || '获取用户信息失败')
		return response.data.data!
	}

	// 修改密码
	async changePassword(data: AuthChangePasswordReq) {
		const response = await axClient.post<ApiResponse<void>>('/users/change-password', data)
		if (response.data.code !== 200) throw new Error(response.data.msg || '修改密码失败')
		return response.data
	}
}

export const authApi = new AuthApi()
