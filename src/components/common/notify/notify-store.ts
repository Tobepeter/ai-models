import { create } from 'zustand'
import { combine } from 'zustand/middleware'

export interface DialogConfig {
	title: string
	description: string
	onConfirm?: () => void
	onCancel?: () => void
	confirmText?: string
	cancelText?: string
}

// 初始状态
const notifyState = {
	showDialog: false,
	dialogConfig: null as DialogConfig | null,
}

type NotifyState = typeof notifyState

const stateCreator = () => {
	return combine(notifyState, (set, get) => ({
		setData: (data: Partial<NotifyState>) => set(data),

		// 显示确认对话框
		showConfirmDialog: (config: DialogConfig) => {
			set({
				showDialog: true,
				dialogConfig: {
					confirmText: '确认',
					cancelText: '取消',
					...config,
				},
			})
		},

		// 隐藏对话框
		hideDialog: () => {
			set({
				showDialog: false,
				dialogConfig: null,
			})
		},
	}))
}

export type NotifyStore = ReturnType<typeof stateCreator>

export const useNotifyStore = create(stateCreator())
