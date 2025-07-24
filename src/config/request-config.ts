import { isDev } from '@/utils/env'

export const requestConfig = {
	timeout: 5 * 1000, // 5秒 - 普通请求超时
	chatTimeout: 30 * 1000, // 30秒 - Chat API 超时

	devOssNode: 'http://localhost:3001',
	serverUrl: isDev ? 'http://localhost:8080' : 'https://tobeei.com/api',
}
