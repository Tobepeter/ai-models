import { axClient } from '../ax-client'
import {
  UserResp,
  UserListReq,
  UserUpdateProfileReq
} from '../types/user-types'
import { ApiResp, PaginatedResponse as PaginatedRes } from '../common'

/** 用户管理API类 */
class UserApi {

  /** 获取用户列表（管理员） */
  async getUsers(params: UserListReq = {}) {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })

    let url = '/users'
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`
    }
    
    const response = await axClient.get<ApiResp<PaginatedRes<UserResp>>>(url)
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取用户列表失败')
    return response.data.data!
  }

  /** 获取当前用户信息 */
  async getCurrentUser() {
    const response = await axClient.get<ApiResp<UserResp>>('/users/me')
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取用户信息失败')
    return response.data.data!
  }

  /** 获取当前用户资料 (向后兼容) */
  async getProfile() {
    return this.getCurrentUser()
  }

  /** 根据ID获取用户信息 */
  async getUserById(id: number) {
    const response = await axClient.get<ApiResp<UserResp>>(`/users/${id}`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取用户信息失败')
    return response.data.data!
  }

  /** 更新用户资料 */
  async updateProfile(data: UserUpdateProfileReq) {
    const response = await axClient.put<ApiResp<UserResp>>('/users/me', data)
    if (response.data.code !== 200) throw new Error(response.data.msg || '更新用户资料失败')
    return response.data.data!
  }

  /** 删除用户（管理员） */
  async deleteUser(id: number) {
    const response = await axClient.delete<ApiResp<void>>(`/users/${id}`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '删除用户失败')
  }

  /** 切换用户状态（管理员） */
  async toggleUserStatus(id: number) {
    const response = await axClient.patch<ApiResp<UserResp>>(`/users/${id}/toggle-status`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '切换用户状态失败')
    return response.data.data!
  }

  /** 激活用户（管理员 - 向后兼容） */
  async activateUser(id: number) {
    const response = await axClient.post<ApiResp<UserResp>>(`/users/${id}/activate`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '激活用户失败')
    return response.data.data!
  }

  /** 停用用户（管理员 - 向后兼容） */
  async deactivateUser(id: number) {
    const response = await axClient.post<ApiResp<UserResp>>(`/users/${id}/deactivate`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '停用用户失败')
    return response.data.data!
  }

  /** 检查用户名是否可用 */
  async checkUsername(username: string) {
    const response = await axClient.get<ApiResp<{ available: boolean }>>(`/users/check-username?username=${username}`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '检查用户名失败')
    return response.data.data!.available
  }

  /** 检查邮箱是否可用 */
  async checkEmail(email: string) {
    const response = await axClient.get<ApiResp<{ available: boolean }>>(`/users/check-email?email=${email}`)
    if (response.data.code !== 200) throw new Error(response.data.msg || '检查邮箱失败')
    return response.data.data!.available
  }

  /** 上传头像 */
  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await axClient.post<ApiResp<{ avatar: string }>>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (response.data.code !== 200) throw new Error(response.data.msg || '上传头像失败')
    return response.data.data!
  }
}

/** 导出单例实例 */
export const userApi = new UserApi()
