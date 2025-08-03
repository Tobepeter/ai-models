import { notify } from '@/components/common/notify'
import { requestConfig } from '@/config/request-config'
import { useUserStore } from '@/store/user-store'
import { jwt } from '@/utils/jwt'
import { Api } from './swagger/generated'
import { isDev } from '@/utils/env'

const verbose = isDev && true // current hard code true

const api = new Api({
	baseURL: requestConfig.serverUrl,
	withCredentials: false, // 确保不发送 cookies
	timeout: requestConfig.timeout,
})

api.instance.interceptors.request.use((config) => {
	if (verbose) {
		console.log(`[api] request ${config.method?.toUpperCase()} ${config.url}`)
	}

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

		if (verbose) {
			console.log(`[api] response succ ${config.method?.toUpperCase()} ${config.url}`, data)
		}

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
	async (error) => {
		const response = error.response
		const config = error.config || {}
		const { noErrorToast, silent, skipAuthRefresh } = config

		// 处理401错误 - 自动刷新token
		if (response?.status === 401 && !config._retry && !skipAuthRefresh && !config.url?.includes('/auth/refresh-token')) {
			config._retry = true

			try {
				const { token, refreshToken } = useUserStore.getState()

				// 优先使用refreshToken，如果没有则使用当前token
				const tokenForRefresh = refreshToken || token
				if (!tokenForRefresh) {
					// 没有可用的token，直接跳转登录
					useUserStore.getState().goLogin()
					return Promise.reject(error)
				}

				if (verbose) {
					console.log('[api] attempting to refresh token...', refreshToken ? 'using refreshToken' : 'using current token')
				}

				// 调用刷新token接口，使用特殊标记避免循环
				const refreshResponse = await api.instance.post(
					'/users/refresh-token',
					{},
					{
						skipAuthRefresh: true, // 关键：避免刷新接口触发循环
						headers: {
							Authorization: `Bearer ${tokenForRefresh}`,
						},
					}
				)

				if (refreshResponse.data?.data?.token) {
					const newToken = refreshResponse.data.data.token
					const newRefreshToken = refreshResponse.data.data.refresh_token

					// 更新store中的token和refreshToken
					const updateData: { token: string; refreshToken?: string } = { token: newToken }
					if (newRefreshToken) {
						updateData.refreshToken = newRefreshToken
					}
					useUserStore.getState().setData(updateData)

					// 更新原请求的Authorization头
					config.headers.Authorization = `Bearer ${newToken}`

					if (verbose) {
						console.log('[api] token refreshed successfully, retrying original request')
					}

					// 重试原请求
					return api.instance.request(config)
				}
			} catch (refreshError) {
				if (verbose) {
					console.log('[api] token refresh failed:', refreshError)
				}
				// 刷新失败，清除用户数据并跳转登录
				useUserStore.getState().clear()
				useUserStore.getState().goLogin()
				return Promise.reject(refreshError)
			}
		}

		// 错误优先级 业务错误 -> 响应码错误 -> 请求失败
		const errMsg = response?.data?.msg || response?.data?.message || response?.statusText || response?.status || error.message || '请求失败'

		if (verbose) {
			console.log(`[api] response err ${config.method?.toUpperCase()} ${config.url}`, errMsg)
		}

		// 默认的内部自动error toast
		if (!noErrorToast || silent) {
			if (!silent) {
				notify.error('请求错误', {
					description: errMsg,
				})
			}
			// swagger的client默认会解包
			return Promise.resolve({ data: null })
		}

		return Promise.reject(errMsg)
	}
)

// 目前似乎只能这么拓展
declare module 'axios' {
	export interface AxiosRequestConfig {
		noAuth?: boolean // 是否跳过认证header
		noErrorToast?: boolean // 是否不需要内部自动处理错误提示，并且返回 null
		silent?: boolean // 彻底静音，此时错误静默返回 null
		skipAuthRefresh?: boolean // 是否跳过自动token刷新（避免死循环）
		_retry?: boolean // 内部标记，表示是否已经重试过
	}
}

export { api }
