import { useUserStore } from '@/store/user-store'
import { jwt } from '@/utils/jwt'
import { isDev } from '@/utils/env'
import type { AxiosRequestConfig } from 'axios'

/**
 * API工具类 - 封装认证和token刷新逻辑
 */
class ApiUtil {
	verbose = isDev && true // 调制开关

	// 设置认证头
	setAuthHeader(config: AxiosRequestConfig, token: string) {
		config.headers = config.headers || {}
		config.headers.Authorization = `Bearer ${token}`
	}

	// 获取用于刷新的token
	getRefreshableToken() {
		const { token, refreshToken, refreshTokenPayload } = useUserStore.getState()

		// 优先使用refreshToken，如果没有则使用当前token
		const tokenForRefresh = refreshToken || token
		if (!tokenForRefresh) {
			return ''
		}

		// 如果使用refreshToken，检查是否过期
		if (refreshToken && refreshTokenPayload && !jwt.isValid(refreshTokenPayload)) {
			if (this.verbose) {
				console.log('[api] refresh token expired, skip refresh attempt')
			}
			return ''
		}

		return tokenForRefresh
	}

	// 执行token刷新
	async performTokenRefresh(api: any, tokenForRefresh: string) {
		if (this.verbose) {
			console.log('[api] attempting to refresh token...')
		}

		// 使用生成的API调用刷新接口
		const refreshResp = await api.users.refreshToken({
			_isRefreshToken: true, // 防止循环
			noErrorToast: true, // 不让拦截器处理错误，我们手动处理
			headers: { Authorization: `Bearer ${tokenForRefresh}` },
		})

		// 检查业务返回码
		if (refreshResp.code === 0) {
			const newToken = refreshResp.data.token
			const newRefreshToken = refreshResp.data.refresh_token
			useUserStore.getState().setData({ token: newToken, refreshToken: newRefreshToken })

			if (this.verbose) {
				console.log('[api] token refreshed successfully')
			}

			return newToken
		} else {
			// 业务错误，抛出异常
			throw new Error(refreshResp.message || 'Token refresh failed')
		}
	}

	// 处理刷新失败
	handleRefreshFailure(config: AxiosRequestConfig, error: any) {
		if (this.verbose) {
			console.log('[api] token refresh failed:', error)
		}

		// 刷新失败，清除用户数据并跳转登录
		useUserStore.getState().clear()
		if (config.redirectLogin !== false) {
			// 默认为true
			useUserStore.getState().goLogin()
		}
	}

	// 提取错误信息
	getErrMsg(error: any) {
		const response = error.response
		// 优先级，后端的 msg -> 状态 -> 错误信息（比如超时）
		return response?.data?.msg || response?.data?.message || response?.statusText || response?.status || error.message || '请求失败'
	}
}

export const apiUtil = new ApiUtil()
