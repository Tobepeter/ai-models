import { QueryClient } from '@tanstack/react-query'

/* tanstack-query 配置 */
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 3,
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
			staleTime: 5 * 60 * 1000, // 5分钟
			gcTime: 10 * 60 * 1000, // 10分钟
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: 1,
		},
	},
})

export const queryKeys = {
	userProfile: ['user', 'profile'],
}
