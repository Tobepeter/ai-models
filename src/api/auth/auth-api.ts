import { axClient } from '../ax-client'
import { AuthLoginReq, AuthRegisterReq, AuthLoginResp, AuthRegisterResp, AuthChangePasswordReq } from '../types/auth-types'
import { UserResp } from '../types/user-types'
import { ApiResp } from '../common'

// 认证相关API
class AuthApi {
	// 登录
	async login(data: AuthLoginReq) {
		const res = await axClient.post<ApiResp<AuthLoginResp>>('/users/login', data)
		if (res.data.code !== 200) throw new Error(res.data.msg || '登录失败')
		const r = res.data.data!
		axClient.setToken(r.token)
		return r
	}

	// 注册
	async register(data: AuthRegisterReq) {
		const res = await axClient.post<ApiResp<AuthRegisterResp>>('/users/register', {
			username: data.username,
			email: data.email,
			password: data.password,
		})
		if (res.data.code !== 200) throw new Error(res.data.msg || '注册失败')
		const r = res.data.data!
		axClient.setToken(r.token)
		return r
	}

	// 退出登录
	async logout() {
		try {
			await axClient.post('/users/logout')
		} catch (e) {
			console.error('Logout API call failed:', e)
		} finally {
			axClient.clearToken()
		}
		return { success: true }
	}

	// 获取用户信息
	async getProfile() {
		const res = await axClient.get<ApiResp<UserResp>>('/users/profile')
		if (res.data.code !== 200) throw new Error(res.data.msg || '获取用户信息失败')
		return res.data.data!
	}

	// 修改密码
	async changePassword(data: AuthChangePasswordReq) {
		const res = await axClient.post<ApiResp<void>>('/users/change-password', data)
		if (res.data.code !== 200) throw new Error(res.data.msg || '修改密码失败')
		return res.data
	}
}

export const authApi = new AuthApi()
