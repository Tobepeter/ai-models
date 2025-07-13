import { isDev } from './env'
import { useChatStore } from '@/pages/chat/chat-store'

let debug = {
	init: () => {},
}

if (isDev) {
	class DebugClass {
		init() {
			this.initGlobal()
		}

		initGlobal() {
			this.defineGetter('chatStore', () => useChatStore.getState())
		}

		private defineGetter(name: string, getter: () => any) {
			Object.defineProperty(window, name, {
				get: getter,
			})
		}
	}

	debug = new DebugClass()
}

export default debug
