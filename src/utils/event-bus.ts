import { ComputedTheme } from '@/store/store'
import { useUnmount } from 'ahooks'
import { EventEmitter } from 'eventemitter3'

export enum EventType {
	ChatStop = 'chat-stop',
	ThemeUpdate = 'theme-update',
}

export type EventMap = {
	[EventType.ChatStop]: [string] // 停止的上一条消息，方便继续生成
	[EventType.ThemeUpdate]: [ComputedTheme] // 主题更新
}

export const eventBus = new EventEmitter<EventMap>()

export const useEvent = <T extends EventType>(event: T, fn: (...args: EventMap[T]) => void) => {
	useUnmount(() => {
		eventBus.off(event, fn)
	})

	eventBus.on(event, fn)

	return () => eventBus.off(event, fn)
}
