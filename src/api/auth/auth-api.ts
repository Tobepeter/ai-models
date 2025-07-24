import { axiosClient } from '../axios-client'
import { LoginRequest, RegisterRequest, LoginResponse, RegisterResponse, AuthUser, ChangePasswordRequest } from '../types/auth-types'
import { ApiResponse } from '../common'

/** 认证相关API类 */
class AuthApi {
	// 登录
	async login(data: LoginRequest) {
		const response = await axiosClient.post<ApiResponse<LoginResponse>>('/users/login', data)
		if (response.data.code !== 200) throw new Error(response.data.msg || '登录失败')
		const result = response.data.data!
		localStorage.setItem('auth_token', result.token) // 存储token
		return result
	}

	// 注册
	async register(data: RegisterRequest) {
		const response = await axiosClient.post<ApiResponse<RegisterResponse>>('/users/register', {
			username: data.username,
			email: data.email,
			password: data.password,
		})
		if (response.data.code !== 200) throw new Error(response.data.msg || '注册失败')
		const result = response.data.data!
		localStorage.setItem('auth_token', result.token) // 存储token
		return result
	}

	// 获取用户信息
	async getProfile() {
		const response = await axiosClient.get<ApiResponse<AuthUser>>('/users/profile')
		if (response.data.code !== 200) throw new Error(response.data.msg || '获取用户信息失败')
		return response.data.data!
	}

	// 更新用户信息
	async updateProfile(data: Partial<AuthUser>) {
		const response = await axiosClient.put<ApiResponse<AuthUser>>('/users/profile', data)
		if (response.data.code !== 200) throw new Error(response.data.msg || '更新用户信息失败')
		return response.data.data!
	}

	// 修改密码
	async changePassword(data: ChangePasswordRequest) {
		const response = await axiosClient.post<ApiResponse<{ message: string }>>('/users/change-password', {
			old_password: data.oldPassword,
			new_password: data.newPassword,
		})
		if (response.data.code !== 200) throw new Error(response.data.msg || '修改密码失败')
	}

	// 登出
	logout() {
		localStorage.removeItem('auth_token')
	}

	// 是否已认证
	isAuthenticated() {
		const token = localStorage.getItem('auth_token')
		return !!token
	}
}

export const authApi = new AuthApi()
