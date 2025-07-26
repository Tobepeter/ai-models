import { api } from '../api'
import type { UserUpdateRequest, UserResponse } from '../types/generated'

/** 用户相关API */
class UserApi {
	/** 获取用户信息 */
	async getProfile(): Promise<UserResponse> {
		const res = await api.users.profileList()
		if (res.data.code !== 200) throw new Error(res.data.message || '获取用户信息失败')
		return res.data.data!
	}

	/** 更新用户信息 */
	async updateProfile(data: UserUpdateRequest): Promise<UserResponse> {
		const res = await api.users.profileUpdate(data)
		if (res.data.code !== 200) throw new Error(res.data.message || '更新用户信息失败')
		return res.data.data!
	}
}

export const userApi = new UserApi()
