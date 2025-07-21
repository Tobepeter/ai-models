
export const requestConfig = {
	timeout: 5 * 1000, // 5秒 - 普通请求超时
	chatTimeout: 30 * 1000, // 30秒 - Chat API 超时

	serverUrls: {
		devOssNode: 'http://localhost:3001',
		devGo: 'http://localhost:8080',
		prod: 'https://tobeei.com/api',
	},
}