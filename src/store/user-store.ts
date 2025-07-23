import { dummy } from '@/utils/dummy'
import { UserProfile, UserSettings, UserStats } from '@/types/user-types'
import { create } from 'zustand'

export interface UserStore {
	profile: UserProfile
	stats: UserStats
	settings: UserSettings
	isLoading: boolean
	
	// Actions
	updateProfile: (updates: Partial<UserProfile>) => void
	updateStats: (updates: Partial<UserStats>) => void
	updateSettings: (updates: Partial<UserSettings>) => void
	setLoading: (loading: boolean) => void
	logout: () => void
}

// 默认用户数据
const defaultProfile: UserProfile = {
	id: 'demo-user-001',
	name: '演示用户',
	email: 'demo@example.com',
	avatar: dummy.avatar,
	joinDate: '2024-01-01',
	lastLoginDate: new Date().toISOString().split('T')[0],
	isOnline: true,
}

const defaultStats: UserStats = {
	textChatCount: 128,
	imageGenCount: 45,
	audioGenCount: 12,
	videoGenCount: 8,
	chatHubUsageCount: 23,
	monthlyActiveDays: 15,
	totalUsageDays: 89,
}

const defaultSettings: UserSettings = {
	theme: 'system',
	language: 'zh-CN',
	notifications: true,
	autoSave: true,
	streamingEnabled: true,
}

export const useUserStore = create<UserStore>((set, get) => ({
	profile: defaultProfile,
	stats: defaultStats,
	settings: defaultSettings,
	isLoading: false,

	updateProfile: (updates) => {
		set((state) => ({
			profile: { ...state.profile, ...updates },
		}))
	},

	updateStats: (updates) => {
		set((state) => ({
			stats: { ...state.stats, ...updates },
		}))
	},

	updateSettings: (updates) => {
		set((state) => ({
			settings: { ...state.settings, ...updates },
		}))
	},

	setLoading: (loading) => {
		set({ isLoading: loading })
	},

	logout: () => {
		// 重置为默认状态
		set({
			profile: defaultProfile,
			stats: defaultStats,
			settings: defaultSettings,
			isLoading: false,
		})
	},
}))
