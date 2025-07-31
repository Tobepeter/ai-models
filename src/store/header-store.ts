import { ReactNode } from 'react'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

const headerState = {
	title: '' as ReactNode, // 自定义的title
}

const stateCreator = () => {
	return combine(headerState, (set, get) => ({
		setTitle: (title: ReactNode) => set({ title }),
		reset: () => set(headerState),
	}))
}

export const useHeaderStore = create(stateCreator())

export type HeaderStore = ReturnType<typeof useHeaderStore>
