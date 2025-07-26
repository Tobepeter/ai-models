import { notify } from '@/components/common/notify'
import { requestConfig } from '@/config/request-config'
import { useUserStore } from '@/store/user-store'
import { jwt } from '@/utils/jwt'
import { Api } from './types/generated'

const api = new Api({
	baseURL: requestConfig.serverUrl,
	withCredentials: false, // 确保不发送 cookies
	timeout: requestConfig.timeout,
})

api.instance.interceptors.request.use((config) => {
	if (config.noAuth) {
		return config
	}

	const { token, tokenPayload, goLogin } = useUserStore.getState()

	// 如果有token但已过期，跳转登录
	if (token && tokenPayload && !jwt.isValid(tokenPayload)) {
		goLogin()
		return Promise.reject(new Error('Token expired'))
	}

	// 如果有有效token，添加到请求头
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	// 没有token的情况暂时放开，不强制要求所有接口都需要token

	return config
})

// 响应拦截器 - 处理错误和自动toast
api.instance.interceptors.response.use(
	(response) => {
		const config = response.config
		const { data } = response

		// 处理业务响应 (HTTP 200 但 business code !== 0)
		if (!config.noErrorToast && data && typeof data === 'object') {
			if (data.code === 0) {
				return response
			}
			notify.error(data.message || '未知错误')
			return { ...response, data: null }
		}

		return response
	},
	(error) => {
		const config = error.config

		if (config?.noErrorToast) {
			return Promise.resolve({ data: null })
		}

		// 默认显示错误提示
		const message = error.response?.data?.message || error.message || '请求失败'
		notify.error('请求错误', {
			description: message,
			duration: 4000,
		})

		return Promise.reject(error)
	}
)

// 目前似乎只能这么拓展
declare module 'axios' {
	export interface AxiosRequestConfig {
		noAuth?: boolean
		noErrorToast?: boolean
	}
}

export { api }
