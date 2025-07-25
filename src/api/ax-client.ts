import { requestConfig } from '@/config/request-config'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useUserStore } from '@/store/user-store'

/* 统一的axios客户端 */
class AxClient {
	client: AxiosInstance

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
				const axConfig = config as AxReqCfg
				if (!axConfig.noAuth) {
					const { token } = useUserStore.getState()
					if (token) axConfig.headers = { ...axConfig.headers, Authorization: `Bearer ${token}` }
				}
				return axConfig as any
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
		useUserStore.setState({ token: '' })
	}

	get<T = any>(url: string, config?: AxReqCfg): Promise<AxiosResponse<T>> {
		return this.client.get(url, config)
	}

	post<T = any>(url: string, data?: T, config?: AxReqCfg): Promise<AxiosResponse<T>> {
		return this.client.post(url, data, config)
	}

	put<T = any>(url: string, data?: any, config?: AxReqCfg): Promise<AxiosResponse<T>> {
		return this.client.put(url, data, config)
	}

	delete<T = any>(url: string, config?: AxReqCfg): Promise<AxiosResponse<T>> {
		return this.client.delete(url, config)
	}

	patch<T = any>(url: string, data?: any, config?: AxReqCfg): Promise<AxiosResponse<T>> {
		return this.client.patch(url, data, config)
	}
}

export interface AxReqCfg extends AxiosRequestConfig {
	noAuth?: boolean
}

export const axClient = new AxClient()
