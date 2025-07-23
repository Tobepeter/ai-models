export interface UserProfile {
	id: string
	name: string
	email: string
	avatar: string
	joinDate: string
	lastLoginDate: string
	isOnline: boolean
}

export interface UserStats {
	textChatCount: number
	imageGenCount: number
	audioGenCount: number
	videoGenCount: number
	chatHubUsageCount: number
	monthlyActiveDays: number
	totalUsageDays: number
}

export interface UserSettings {
	theme: 'light' | 'dark' | 'system'
	language: 'zh-CN' | 'en-US'
	notifications: boolean
	autoSave: boolean
	streamingEnabled: boolean
}
