import { isDev } from '@/utils/env'

let testMgr = {
	compMap: {},
	cache: {},
	init: () => {},
	load: async (path: string) => null as any,
	getKeys: () => [] as string[],
}

if (isDev) {
	class TestMgr {
		compMap = {}
		cache = {}

		init() {
			const files = import.meta.glob('./components/test-*.tsx')
			this.compMap = {}
			this.cache = {}

			for (const path of Object.keys(files)) {
				// 移除前缀和文件后缀
				let name = path.split('/').pop() || ''
				name = name.replace(/^test-|\.tsx$/g, '')
				this.compMap[name] = {
					path,
					name,
					load: async () => ((await files[path]()) as any).default,
				}
			}
		}

		async load(name: string) {
			const item = this.compMap[name]
			if (!item) return null
			if (this.cache[name]) return this.cache[name]
			return (this.cache[name] = await item.load())
		}

		getKeys() {
			return Object.keys(this.compMap)
		}
	}

	testMgr = new TestMgr()
}

export { testMgr }
