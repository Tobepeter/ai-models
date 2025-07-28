import { isDev } from './env'
import { useChatStore } from '@/pages/chat/chat-store'
import { useAppStore } from '@/store/app-store'
import { useUserStore } from '@/store/user-store'

let debug = {
	init: () => {},
}

if (isDev) {
	class DebugClass {
		init() {
			this.initGlobal()
		}

		initGlobal() {
			this.defineGetter('appStore', () => {
				return useAppStore.getState()
			})

			this.defineGetter('userStore', () => {
				return useUserStore.getState()
			})

			this.defineGetter('chatStore', () => {
				return useChatStore.getState()
			})
		}

		private defineGetter(name: string, getter: () => any) {
			// NOTE: hot reoload 多次 define 会报错
			//  TypeError: Cannot redefine property: chatStore
			if (!(name in window)) {
				Object.defineProperty(window, name, {
					get: getter,
				})
			}
		}
	}

	debug = new DebugClass()
}

export default debug
