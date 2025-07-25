// 统一导出所有API功能

// 基础配置
export { axClient as axiosClient } from './ax-client'
export { queryClient } from './query-client'

// 通用类型和工具
export * from './common'
export * from './types'

// 认证相关
export { authApi } from './auth/auth-api'
export {
  useLogin,
  useRegister,
  useChangePassword,
  useLogout,
} from './auth/auth-query'

// 用户相关
export { userApi } from './user/user-api'
export {
  useUsers,
  useUser,
  useProfile as useUserProfile,
  useUpdateProfile as useUpdateUserProfile,
  useDeleteUser,
  useActivateUser,
  useDeactivateUser,
  useCheckUsername,
  useCheckEmail,
} from './user/user-query'

// OSS相关
export * from './oss'

// AI相关
export * from './ai'

// CRUD相关 - 统一的CRUD操作
export * from './crud'
