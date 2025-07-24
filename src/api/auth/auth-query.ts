import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from './auth-api'
import { queryKeys } from '../query-client'

const { userProfile } = queryKeys

// 登录
export const useLogin = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: authApi.login,
		onSuccess: () => {
			// 登录成功后刷新用户信息查询
			queryClient.invalidateQueries({ queryKey: userProfile })
		},
		onError: (error) => {
			console.error('登录失败:', error)
		},
	})
}

// 注册
export const useRegister = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: authApi.register,
		onSuccess: () => {
			// 注册成功后刷新用户信息查询
			queryClient.invalidateQueries({ queryKey: userProfile })
		},
		onError: (error) => {
			console.error('注册失败:', error)
		},
	})
}

// 获取用户信息
export const useProfile = () => {
	return useQuery({
		queryKey: userProfile,
		queryFn: authApi.getProfile,
		enabled: authApi.isAuthenticated(),
		staleTime: 5 * 60 * 1000, // 5分钟
	})
}

// 更新用户信息
export const useUpdateProfile = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: authApi.updateProfile,
		onSuccess: () => {
			// 更新成功后刷新用户信息查询
			queryClient.invalidateQueries({ queryKey: userProfile })
		},
		onError: (error) => {
			console.error('更新用户信息失败:', error)
		},
	})
}

// 修改密码
export const useChangePassword = () => {
	return useMutation({
		mutationFn: authApi.changePassword,
		onError: (error) => {
			console.error('修改密码失败:', error)
		},
	})
}

// 登出
export const useLogout = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async () => {
			authApi.logout()
		},
		onSuccess: () => {
			// 登出后清除所有查询缓存
			queryClient.clear()
		},
	})
}
