import { isDev } from '@/utils/env'
import { TestCache, TestComponent, TestComponentMap } from './test-types'

let testMgr = {
	testComponentsMap: {} as TestComponentMap,
	testCache: {} as TestCache,
	init: () => {},
	load: async (path: string) => null as any,
	getKeys: () => [] as string[],
}

if (isDev) {
	class TestMgr {
		testComponentsMap: TestComponentMap
		testCache: TestCache

		constructor() {
			this.testComponentsMap = {}
			this.testCache = {}
		}

		init() {
			// 使用 glob 获取所有 test- 组件
			const files = import.meta.glob('./components/test-*.tsx')

			this.testComponentsMap = {}
			this.testCache = {}

			for (const path of Object.keys(files)) {
				const pathParts = path.split('/')
				const fileName = pathParts[pathParts.length - 1]
				// 移除 test- 前缀和 .tsx 后缀
				const name = fileName.replace('test-', '').replace('.tsx', '')

				this.testComponentsMap[name] = {
					path,
					name,
					load: async () => {
						const mod = (await files[path]()) as any
						// 使用默认导出
						return mod.default
					},
				}
			}
		}

		async load(name: string) {
			const item = this.testComponentsMap[name]

			if (!item) return null

			if (this.testCache[name]) return this.testCache[name]

			const result = await item.load()
			this.testCache[name] = result
			return result
		}

		getKeys() {
			return Object.keys(this.testComponentsMap)
		}
	}

	testMgr = new TestMgr()
}

export { testMgr }
