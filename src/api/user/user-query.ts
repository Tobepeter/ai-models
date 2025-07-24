import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userApi } from './user-api'
import { UserListReq, UserUpdateProfileReq } from '../types/user-types'

/** 用户相关React Query hooks */

/** 获取用户列表（管理员） */
export const useUsers = (params: UserListReq = {}) => {
  return useQuery({
    queryKey: ['users', 'list', params],
    queryFn: () => userApi.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

/** 根据ID获取用户（管理员） */
export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

/** 获取当前用户资料 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['users', 'profile'],
    queryFn: userApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

/** 更新用户资料 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      // 更新成功后刷新用户资料查询
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] })
    },
    onError: (error) => {
      console.error('更新用户资料失败:', error)
    },
  })
}

/** 删除用户（管理员） */
export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      // 删除成功后刷新用户列表
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
    },
    onError: (error) => {
      console.error('删除用户失败:', error)
    },
  })
}

/** 激活用户（管理员） */
export const useActivateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userApi.activateUser,
    onSuccess: () => {
      // 激活成功后刷新相关查询
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      console.error('激活用户失败:', error)
    },
  })
}

/** 停用用户（管理员） */
export const useDeactivateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userApi.deactivateUser,
    onSuccess: () => {
      // 停用成功后刷新相关查询
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      console.error('停用用户失败:', error)
    },
  })
}

/** 检查用户名可用性 */
export const useCheckUsername = (username: string) => {
  return useQuery({
    queryKey: ['users', 'check-username', username],
    queryFn: () => userApi.checkUsername(username),
    enabled: !!username && username.length >= 3,
    staleTime: 30 * 1000, // 30秒
  })
}

/** 检查邮箱可用性 */
export const useCheckEmail = (email: string) => {
  return useQuery({
    queryKey: ['users', 'check-email', email],
    queryFn: () => userApi.checkEmail(email),
    enabled: !!email && email.includes('@'),
    staleTime: 30 * 1000, // 30秒
  })
}
