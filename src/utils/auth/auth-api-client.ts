import axios, { AxiosInstance } from 'axios'
import { requestConfig } from '@/config/request-config'
import {
	AuthLoginReq,
	AuthRegisterReq,
	AuthLoginResp,
	AuthRegisterResp,
	AuthUser,
	AuthChangePasswordReq
} from '@/api/types/auth-types'
import { ApiResponse } from '@/api/common'

/**
 * 认证API客户端
 * 处理用户登录、注册、token管理等认证相关操作
 */
class AuthApiClient {
	private client: AxiosInstance

	constructor() {
		this.client = axios.create({
			baseURL: requestConfig.serverUrl,
			timeout: requestConfig.timeout,
			headers: {
				'Content-Type': 'application/json',
			},
		})

		// 请求拦截器 - 添加token
		this.client.interceptors.request.use((config) => {
			const token = this.getStoredToken()
			if (token) {
				config.headers.Authorization = `Bearer ${token}`
			}
			return config
		})

		// 响应拦截器 - 处理错误
		this.client.interceptors.response.use(
			(response) => response,
			(error) => {
				if (error.response?.status === 401) {
					// token过期或无效，清除本地存储
					this.clearToken()
					// 可以在这里触发重新登录
					window.location.href = '/login'
				}
				return Promise.reject(error)
			}
		)
	}

	/** 用户登录 */
	async login(data: AuthLoginReq): Promise<AuthLoginResp> {
		const response = await this.client.post<ApiResponse<AuthLoginResp>>('/users/login', data)
		
		if (response.data.code !== 200) {
			throw new Error(response.data.msg || '登录失败')
		}

		const result = response.data.data!
		// 存储token
		this.setToken(result.token)
		return result
	}

	/** 用户注册 */
	async register(data: AuthRegisterReq): Promise<AuthRegisterResp> {
		const response = await this.client.post<ApiResponse<AuthRegisterResp>>('/users/register', {
			username: data.username,
			email: data.email,
			password: data.password,
		})
		
		if (response.data.code !== 200) {
			throw new Error(response.data.msg || '注册失败')
		}

		const result = response.data.data!
		// 存储token
		this.setToken(result.token)
		return result
	}

	/** 获取用户信息 */
	async getProfile(): Promise<AuthUser> {
		const response = await this.client.get<ApiResponse<AuthUser>>('/users/profile')
		
		if (response.data.code !== 200) {
			throw new Error(response.data.msg || '获取用户信息失败')
		}

		return response.data.data!
	}

	/** 更新用户信息 */
	async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
		const response = await this.client.put<ApiResponse<AuthUser>>('/users/profile', data)
		
		if (response.data.code !== 200) {
			throw new Error(response.data.msg || '更新用户信息失败')
		}

		return response.data.data!
	}

	/** 修改密码 */
	async changePassword(data: AuthChangePasswordReq): Promise<void> {
		const response = await this.client.post<ApiResponse<{ message: string }>>('/users/change-password', {
			old_password: data.oldPassword,
			new_password: data.newPassword,
		})
		
		if (response.data.code !== 200) {
			throw new Error(response.data.msg || '修改密码失败')
		}
	}

	/** 退出登录 */
	logout(): void {
		this.clearToken()
	}

	/** 检查是否已登录 */
	isAuthenticated(): boolean {
		const token = this.getStoredToken()
		return !!token
	}

	/** 获取存储的token */
	private getStoredToken(): string | null {
		return localStorage.getItem('auth_token')
	}

	/** 存储token */
	private setToken(token: string): void {
		localStorage.setItem('auth_token', token)
	}

	/** 清除token */
	private clearToken(): void {
		localStorage.removeItem('auth_token')
	}
}

export const authApiClient = new AuthApiClient()
