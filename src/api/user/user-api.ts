import { useUserStore } from '@/store/user-store'
import { api } from '../api'
import type { UserUpdateRequest, UserResponse, ChangePasswordRequest } from '../swagger/generated'

/** 用户相关API */
class UserApi {
	// 获取用户信息
	async getProfile(silent = true): Promise<UserResponse> {
		const res = await api.users.getProfile({ silent })
		if (!res) return null
		const info = res.data
		useUserStore.getState().setData({ info })
		return info
	}

	// 更新用户信息
	async updateProfile(data: UserUpdateRequest): Promise<UserResponse> {
		const res = await api.users.updateProfile(data)
		if (!res) return null
		const info = res.data
		useUserStore.getState().setData({ info })
		return info
	}

	// 更新密码
	async updatePassword(data: ChangePasswordRequest) {
		const res = await api.users.changePasswordCreate(data)
		if (!res) return false
		return true
	}
}

export const userApi = new UserApi()
