import { useUnmount } from 'ahooks'
import { EventEmitter } from 'eventemitter3'

export enum EventType {
	ChatStop = 'chat-stop',
}

export type EventMap = {
	[EventType.ChatStop]: [string] // 停止的上一条消息，方便继续生成
}

export const eventBus = new EventEmitter<EventMap>()

export const useEvent = <T extends EventType>(event: T, fn: (...args: EventMap[T]) => void) => {
	const off = eventBus.off

	useUnmount(() => {
		off(event)
	})

	eventBus.on(event, fn)

	return off
}
