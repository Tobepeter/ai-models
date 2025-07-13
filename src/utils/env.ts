export const mode = import.meta.env.MODE
export const isDev = import.meta.env.DEV
export const isProd = import.meta.env.PROD

export const isMock = isDev && import.meta.env.VITE_MOCK_MODE === 'true'

// AI 平台配置
export const aiConfig = {
	siliconflow: {
		apiKey: import.meta.env.VITE_SILICON_API_KEY || '',
		baseUrl: 'https://api.siliconflow.cn/v1',
	},
	openrouter: {
		apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
		baseUrl: 'https://openrouter.ai/api/v1',
	},
	mock: {
		apiKey: 'mock-token',
		baseUrl: 'http://localhost:3000/v1',
	},
}
