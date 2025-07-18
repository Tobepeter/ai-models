import { OssAccessType } from './oss/oss-types'

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

// OSS 配置
export const ossBucket = import.meta.env.VITE_OSS_BUCKET || ''
export const ossRegion = import.meta.env.VITE_OSS_REGION || ''

export const ossRoleArn = import.meta.env.VITE_OSS_ROLE_ARN || ''

export const ossReadAccess = (import.meta.env.VITE_OSS_READ_ACCESS as OssAccessType) || OssAccessType.Pub
export const ossWriteAccess = (import.meta.env.VITE_OSS_WRITE_ACCESS as OssAccessType) || OssAccessType.Sts

// NOTE: 只有env配置了，ak，这个变量才会注入到前端
let ossAccessKeyId = ''
let ossAccessKeySecret = ''
if (ossReadAccess === OssAccessType.Ak || ossWriteAccess === OssAccessType.Ak) {
	ossAccessKeyId = import.meta.env.VITE_OSS_ACCESS_KEY_ID || ''
	ossAccessKeySecret = import.meta.env.VITE_OSS_ACCESS_KEY_SECRET || ''
}
export { ossAccessKeyId, ossAccessKeySecret }

export const ossBase = __OSS_BASE__
export const ossBasePrefix = __OSS_BASE_PREFIX__
export const buildTime = __BUILD_TIME__
export const buildTimeLocal = __BUILD_TIME_LOCAL__
