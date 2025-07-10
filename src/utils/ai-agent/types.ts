// AI Agent 支持的平台
export enum AIPlatform {
	Silicon = 'silicon',
}

// 基础配置接口
export interface AIAgentConfig {
	apiKey: string
	baseUrl?: string
	model?: string
}

// 文本生成请求参数
export interface TextGenerationRequest {
	prompt: string
	model: string
	maxTokens?: number
}

// 图片生成请求参数
export interface ImageGenerationRequest {
	prompt: string
	model: string
}

// 图片响应
export interface ImageResponse {
	images: Array<{
		url: string
	}>
}

// 流式回调函数
export type StreamCallback = (chunk: string) => void

export interface AIModelConfig {
	text: string[]
	image: string[]
}
