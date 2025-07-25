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

// 初始状态
const gmState = {
	connected: false,
	connecting: false,
	reconnecting: false,
	reconnectAttempts: 0,
	processes: [] as GMLog[],
	ports: [] as GMPortStatus[],
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
				processes: processes.map(p =>
					p.processId === processId ? { ...p, ...updates } : p
				)
			})
		},

		// 重置状态
		reset: () => set(gmState),
		
		// 计算属性
		get canOperate() {
			const { connected, connecting, reconnecting } = get()
			return connected && !connecting && !reconnecting
		},
		
		get shouldShowReconnect() {
			const { connected, connecting, reconnecting } = get()
			return !connected && !connecting && !reconnecting
		},
	}))
}

export const useGMStore = create(stateCreator())

export type GMStore = ReturnType<ReturnType<typeof stateCreator>>
