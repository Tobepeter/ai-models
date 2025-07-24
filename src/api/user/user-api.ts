import { axiosClient } from '../axios-client'
import {
  UserResponse,
  UserListRequest,
  UpdateProfileRequest
} from '../types/user-types'
import { ApiResponse, PaginatedResponse } from '../common'

/** 用户管理API类 */
class UserApi {

  /** 获取用户列表（管理员） */
  async getUsers(params: UserListRequest = {}) {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })

    const response = await axiosClient.get<ApiResponse<PaginatedResponse<UserResponse>>>(`/users?${searchParams}`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取用户列表失败')
    return response.data.data!
  }

  /** 根据ID获取用户（管理员） */
  async getUserById(id: number) {
    const response = await axiosClient.get<ApiResponse<UserResponse>>(`/users/${id}`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取用户信息失败')
    return response.data.data!
  }

  /** 获取当前用户资料 */
  async getProfile() {
    const response = await axiosClient.get<ApiResponse<UserResponse>>('/users/profile')
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取用户资料失败')
    return response.data.data!
  }

  /** 更新当前用户资料 */
  async updateProfile(data: UpdateProfileRequest) {
    const response = await axiosClient.put<ApiResponse<UserResponse>>('/users/profile', data)
    if (response.data.code !== 200) throw new Error(response.data.msg || '更新用户资料失败')
    return response.data.data!
  }

  /** 删除用户（管理员） */
  async deleteUser(id: number) {
    const response = await axiosClient.delete<ApiResponse<void>>(`/users/${id}`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '删除用户失败')
  }

  /** 激活用户（管理员） */
  async activateUser(id: number) {
    const response = await axiosClient.post<ApiResponse<UserResponse>>(`/users/${id}/activate`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '激活用户失败')
    return response.data.data!
  }

  /** 停用用户（管理员） */
  async deactivateUser(id: number) {
    const response = await axiosClient.post<ApiResponse<UserResponse>>(`/users/${id}/deactivate`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '停用用户失败')
    return response.data.data!
  }

  /** 检查用户名是否可用 */
  async checkUsername(username: string) {
    const response = await axiosClient.get<ApiResponse<{ available: boolean }>>(`/users/check-username?username=${username}`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '检查用户名失败')
    return response.data.data!.available
  }

  /** 检查邮箱是否可用 */
  async checkEmail(email: string) {
    const response = await axiosClient.get<ApiResponse<{ available: boolean }>>(`/users/check-email?email=${email}`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '检查邮箱失败')
    return response.data.data!.available
  }
}

/** 导出单例实例 */
export const userApi = new UserApi()
