import { create } from 'zustand'
import { type ReactNode } from 'react'

/**
 * 全局浮动容器状态管理
 */
interface GlobalFloatingState {
	/** 当前激活的内容ID */
	activeContentId?: string
	/** Portal传送的内容 */
	content?: ReactNode
	/** 浮动内容的位置 */
	position?: { x: number; y: number }
	/** 触发元素引用 */
	triggerElement?: Element
	/** 额外的配置参数 */
	config?: {
		placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'bottom-start'
		offset?: number
		closeOnScroll?: boolean
	}
}

interface GlobalFloatingActions {
	/** 显示浮动内容 */
	show: (id: string, content: ReactNode, triggerElement: Element, config?: GlobalFloatingState['config']) => void
	/** 隐藏浮动内容 */
	hide: () => void
	/** 更新位置 */
	updatePosition: (position: { x: number; y: number }) => void
	/** 设置配置 */
	setConfig: (config: GlobalFloatingState['config']) => void
}

export const useGlobalFloatingStore = create<GlobalFloatingState & GlobalFloatingActions>()((set, get) => ({
	// 状态
	activeContentId: undefined,
	content: undefined,
	position: undefined,
	triggerElement: undefined,
	config: {
		placement: 'bottom-start',
		offset: 8,
		closeOnScroll: true,
	},

	// 动作
	show: (id, content, triggerElement, config) => {
		set({
			activeContentId: id,
			content,
			triggerElement,
			config: { ...get().config, ...config },
		})
	},

	hide: () => {
		set({
			activeContentId: undefined,
			content: undefined,
			position: undefined,
			triggerElement: undefined,
		})
	},

	updatePosition: (position) => {
		set({ position })
	},

	setConfig: (config) => {
		set({ config: { ...get().config, ...config } })
	},
}))

// 导出常用的浮动内容ID常量
export const FLOATING_CONTENT_IDS = {
	COMMENT_INPUT_POPUP: 'comment-input-popup',
} as const
