import type { AIPlatform } from '@/utils/ai-agent/types'

const appKey = 'appdata'

/**
 * 本地存储管理器
 * 统一管理应用数据的本地存储，使用整体写入和读取策略
 */
class Storage {
	private cache: StorageAppData | null = null

	getAppData(): StorageAppData {
		if (this.cache) return this.cache

		try {
			const str = localStorage.getItem(appKey)
			this.cache = str ? JSON.parse(str) : {}
			return this.cache
		} catch (error) {
			console.warn('[Storage] Failed to parse app data:', error)
			localStorage.removeItem(appKey)
			this.cache = {}
			return this.cache
		}
	}

	setAppData(data: StorageAppData, merge = true) {
		try {
			const finalData = merge ? { ...this.getAppData(), ...data } : data
			this.cache = { ...finalData }
			localStorage.setItem(appKey, JSON.stringify(finalData))
		} catch (error) {
			console.error('[Storage] Failed to save app data:', error)
		}
	}

	get<T>(key: string): T | null {
		const appData = this.getAppData()
		return appData[key] ?? null
	}

	set(key: string, value: any) {
		const appData = this.getAppData()
		appData[key] = value
		this.setAppData(appData)
	}

	remove(key: string) {
		const appData = this.getAppData()
		delete appData[key]
		this.setAppData(appData)
	}

	clear() {
		this.cache = null
		localStorage.removeItem(appKey)
	}
}

export const storage = new Storage()

export interface StorageAppData {
	apiKeys?: Partial<Record<AIPlatform, string>>

	ossStsCache?: {
		token: any
		expiry: number
	}

	chatPersist?: {
		platform: AIPlatform
		model: string
		stream?: boolean
	}
}

export const storageKeys = {
	sts: 'oss-sts-cache',
	app: 'app-storage',
	user: 'user-storage',
	authToken: 'auth-token',
	chat: 'chat',
}
