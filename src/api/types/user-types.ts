/** 用户响应格式（与后端UserResponse保持一致） */
export interface UserResponse {
  id: number
  username: string
  email: string
  avatar?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

/** 用户创建请求（与后端UserCreateRequest保持一致） */
export interface UserCreateRequest {
  username: string
  email: string
  password: string
}

/** 用户信息更新请求（与后端UserUpdateRequest保持一致） */
export interface UserUpdateRequest {
  username?: string
  email?: string
  avatar?: string
}

/** 用户列表查询参数 */
export interface UserListRequest {
  page?: number
  limit?: number
  username?: string
  email?: string
  is_active?: boolean
}

/** 更新用户资料请求（别名，保持向后兼容） */
export interface UpdateProfileRequest extends UserUpdateRequest {}