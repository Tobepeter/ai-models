import { notify } from '@/components/common/notify'
import { requestConfig } from '@/config/request-config'
import { useUserStore } from '@/store/user-store'
import { Api } from './swagger/generated'
import { apiUtil } from './api-util'
import { isDev } from '@/utils/env'

const verbose = apiUtil.verbose

const api = new Api({
	baseURL: requestConfig.serverUrl,
	withCredentials: false, // 确保不发送 cookies
	timeout: requestConfig.timeout,
})

api.instance.interceptors.request.use((config) => {
	if (verbose) {
		console.log(`[api] request ${config.method?.toUpperCase()} ${config.url}`)
	}

	// 跳过认证的请求直接放行
	if (config.noAuth) {
		return config
	}

	// NOTE: noAuth 不代表一定要登录才能访问，有的接口不需要登录也可以访问的

	// 如果有token就添加到请求头，没有也继续请求
	const { token } = useUserStore.getState()
	if (token) {
		apiUtil.setAuthHeader(config, token)
	}

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
		const autoHandle = !config.noErrorToast || config.silent
		if (autoHandle && data && typeof data === 'object') {
			if (data.code === 0) {
				return response
			}
			if (!config.silent) {
				notify.error(data.message || '未知错误')
			}
			return { ...response, data: null }
		}

		return response
	},
	async (error) => {
		const response = error.response
		const config = error.config || {}
		const { noAuth, noErrorToast, silent } = config

		// 登录模式，且当前请求不是重复的refreshToken请求，则尝试刷新token
		if (!noAuth && response?.status === 401 && !config._isRefreshToken) {
			try {
				// 获取可用的refresh token
				const token = apiUtil.getRefreshableToken()
				if (!token) {
					throw new Error('refresh token不存在或已过期')
				}

				// 执行token刷新
				const newToken = await apiUtil.performTokenRefresh(api, token)

				// 更新原请求的Authorization头并重试
				apiUtil.setAuthHeader(config, newToken)

				if (verbose) {
					console.log('[api] retrying original request with new token')
				}

				return api.instance.request(config)
			} catch (refreshError) {
				// 处理刷新失败
				apiUtil.handleRefreshFailure(config, refreshError)
				// 让代码继续往下走，使用原始的401错误进行统一处理
			}
		}

		// 提取错误信息
		const errMsg = apiUtil.getErrMsg(error)

		if (verbose) {
			console.log(`[api] response err ${config.method?.toUpperCase()} ${config.url}`, errMsg)
		}

		// 错误处理：自动toast或静默返回null
		if (!noErrorToast || silent) {
			if (!silent) {
				notify.error('请求错误', { description: errMsg })
			}
			return Promise.resolve({ data: null })
		}

		// 需要抛出异常给调用方处理
		return Promise.reject(errMsg)
	}
)

// 扩展axios配置类型
declare module 'axios' {
	export interface AxiosRequestConfig {
		noAuth?: boolean // 跳过认证header
		noErrorToast?: boolean // 不自动处理错误提示，直接抛出异常
		silent?: boolean // 静默模式，错误不显示toast且返回null
		redirectLogin?: boolean // 是否自动跳转登录页，默认true
		_isRefreshToken?: boolean // 标记是否为刷新token请求，防止循环
	}
}

export { api }
