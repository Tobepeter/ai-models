import { create } from 'zustand'
import { combine } from 'zustand/middleware'

// WebSocket 消息类型
export interface GMWsData {
	type: string
	processId?: string
	command?: string
	data?: string
	code?: number
	message?: string
}

// 进程日志接口
export interface GMLog {
	processId: string
	command: string
	logs: string[]
	status: 'running' | 'finished' | 'error'
}

// 端口状态接口
export interface GMPortStatus {
	port: number
	active: boolean
}

// 连接状态类型
export type GMConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

// 初始状态
const gmState = {
	connectionStatus: 'disconnected' as GMConnectionStatus,
	reconnectAttempts: 0, // 重连次数
	processes: [] as GMLog[], // 进程日志
	ports: [] as GMPortStatus[], // 端口状态
}

type GMState = typeof gmState

const stateCreator = () => {
	return combine(gmState, (set, get) => ({
		// 通用状态更新
		setData: (data: Partial<GMState>) => set(data),

		// 进程管理
		addProcess: (process: GMLog) => {
			const { processes } = get()
			set({ processes: [...processes, process] })
		},
		updateProcess: (processId: string, updates: Partial<GMLog>) => {
			const { processes } = get()
			set({
				processes: processes.map((p) => (p.processId === processId ? { ...p, ...updates } : p)),
			})
		},

		// 重置状态
		reset: () => set({ ...gmState }),
	}))
}

export const useGMStore = create(stateCreator())

export type GMStore = ReturnType<ReturnType<typeof stateCreator>>
