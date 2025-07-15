// 平台-模型配置
export interface ChatHubModel {
	id: string
	platform: string
	model: string
	name: string // 显示名称
	enabled: boolean // 是否启用
}

// 卡片状态
export type ChatHubCardStatus = 'not-started' | 'pending' | 'generating' | 'completed' | 'error'

// 卡片数据
export interface ChatHubCard {
	id: string
	platform: string // AI平台标识
	model: string // 模型ID
	modelName: string // 显示名称
	status: ChatHubCardStatus
	question: string // 用户问题
	answer: string // AI回答内容
	error?: string // 错误信息
	timestamp?: number // 创建时间
	startTime?: number // 开始生成时间
	endTime?: number // 完成时间
}
