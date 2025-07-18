import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 3,
			retryDelay: 1000,
			staleTime: 5 * 60 * 1000, // 5 分钟
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: 1,
		},
	},
})
