/// <reference types="vite/client" />

interface ImportMetaEnv {
	// AI 平台配置
	readonly VITE_SILICON_API_KEY: string // SiliconFlow API密钥
	readonly VITE_OPENROUTER_API_KEY: string // OpenRouter API密钥
	readonly VITE_OPENROUTER_BASE_URL: string // OpenRouter API基础URL
	readonly VITE_DASHSCOPE_API_KEY: string // DashScope API密钥
	readonly VITE_MOCK_MODE: string // 是否启用Mock模式

	// OSS 权限配置
	readonly VITE_OSS_ACCESS_KEY_ID: string // OSS访问密钥ID (仅ak模式需要)
	readonly VITE_OSS_ACCESS_KEY_SECRET: string // OSS访问密钥Secret (仅ak模式需要)
	readonly VITE_OSS_BUCKET: string // OSS存储桶名称
	readonly VITE_OSS_REGION: string // OSS区域
	readonly VITE_OSS_READ_ACCESS: string // 读权限模式: sts|api|pub|ak
	readonly VITE_OSS_WRITE_ACCESS: string // 写权限模式: sts|api|pub|ak
}
