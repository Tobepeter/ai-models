// TODO: fix ts
// @ts-nocheck
import { useUserStore } from '@/store/user-store'
import { api } from '../api'
import type { UserUpdateRequest, UserResponse, ChangePasswordRequest } from '../types/generated'

/** 用户相关API */
class UserApi {
	// 获取用户信息
	async getProfile(silent = true): Promise<UserResponse> {
		const res = await api.users.profileList({ silent })
		if (!res) return null
		const response = res.data as UserResponse
		useUserStore.setState({ info: response })
		return response
	}

	// 更新用户信息
	async updateProfile(data: UserUpdateRequest): Promise<UserResponse> {
		const res = await api.users.profileUpdate(data)
		if (!res) return null
		const response = res.data as UserResponse
		useUserStore.setState({ info: response })
		return response
	}

	// 更新密码
	async updatePassword(data: ChangePasswordRequest) {
		const res = await api.users.changePasswordCreate(data)
		if (!res) return false
		return true
	}
}

export const userApi = new UserApi()
