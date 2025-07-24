import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from './auth-api'
import { axClient } from '../ax-client'
import { userApi } from '../user/user-api'

/** 认证相关React Query hooks */

// 定义查询键
const loginQuery = ['auth', 'login']
const userProfile = ['auth', 'profile']

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
