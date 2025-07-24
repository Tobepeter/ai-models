import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { isDev } from '@/utils/env'
import { requestConfig } from '@/config/request-config'

const tokenKey = 'auth_token'

/* 统一的axios客户端 */
class AxClient {
	client: AxiosInstance
	token: string

	init() {
		this.token = localStorage.getItem(tokenKey) || ''
	}

	constructor() {
		this.client = axios.create({
			baseURL: requestConfig.serverUrl,
			timeout: 10 * 1000, // 10s
			headers: {
				'Content-Type': 'application/json',
			},
		})

		this.setupInterceptors()
	}

	private setupInterceptors() {
		// 请求拦截器
		this.client.interceptors.request.use(
			(config) => {
				const token = this.token
				if (token) {
					config.headers.Authorization = `Bearer ${token}`
				}
				return config
			},
			(error) => Promise.reject(error)
		)

		// 响应拦截器
		this.client.interceptors.response.use(
			(response) => response,
			(error) => {
				if (error.response?.status === 401) {
					this.clearToken()
					// TODO: 可以在这里触发登录过期处理
					// window.location.href = '/login'
				}
				return Promise.reject(error)
			}
		)
	}

	clearToken() {
		this.token = ''
		localStorage.removeItem(tokenKey)
	}

	get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.client.get(url, config)
	}

	post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.client.post(url, data, config)
	}

	put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.client.put(url, data, config)
	}

	delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.client.delete(url, config)
	}

	patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return this.client.patch(url, data, config)
	}
}

export const axClient = new AxClient()
