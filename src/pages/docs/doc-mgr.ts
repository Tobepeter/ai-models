import { isDev } from '@/utils/env'
import { DocCache, DocFile, DocFileGroup, DocFileMap } from './doc-types'

let docMgr = {
	docFilesMap: {} as DocFileMap,
	docCache: {} as DocCache,
	sidebarConfigCache: {} as DocFileGroup,
	init: () => {},
	load: async (path: string) => '',
	filterSidebarConfig: (query: string): DocFileGroup => ({}),
}

if (isDev) {
	class DocMgr {
		docFilesMap: DocFileMap
		docCache: DocCache
		sidebarConfigCache: DocFileGroup

		init() {
			// NOTE：vite限制，不能在for语句中
			const files = [
				// == prettier break==
				import.meta.glob('/docs/**/*.md', { query: '?raw' }),
				import.meta.glob('/temp/计划/**/*.md', { query: '?raw' }),
			]

			this.docFilesMap = {}
			this.docCache = {}
			this.sidebarConfigCache = {}

			for (const item of files) {
				const pathKeys = Object.keys(item)
				for (const path of pathKeys) {
					const pathParts = path.split('/')
					const fileName = pathParts[pathParts.length - 1]
					const file = fileName.replace('.md', '')
					const folder = pathParts.length > 2 ? pathParts[pathParts.length - 2] : 'default'

					this.docFilesMap[path] = {
						path,
						folder,
						file,
						load: async () => {
							const mod = (await item[path]()) as any
							return mod.default
						},
					}
				}
			}

			// 初始化缓存sidebar配置
			this.buildSidebarConfig()
		}

		buildSidebarConfig() {
			const groups: DocFileGroup = {}

			for (const path in this.docFilesMap) {
				const item = this.docFilesMap[path]
				const { folder } = item
				if (!groups[folder]) groups[folder] = []
				groups[folder].push(item)
			}

			this.sidebarConfigCache = groups
		}

		/**
		 * 过滤侧边栏配置
		 *
		 * @desc
		 * 组名命中时保留整个组
		 * 文件命中时保留该组和匹配的文件
		 */
		filterSidebarConfig(query: string): DocFileGroup {
			const queryTrim = query.trim()
			const config = this.sidebarConfigCache
			if (!queryTrim) return config

			const results: DocFileGroup = {}
			const queryLower = queryTrim.toLowerCase()

			for (const [folder, items] of Object.entries(config)) {
				const matches = folder.toLowerCase().includes(queryLower)
				let files = items
				if (!matches) {
					files = items.filter((item) => {
						const { file } = item
						const fileLower = file.toLowerCase()
						return fileLower.includes(queryLower)
					})
				}
				if (files.length > 0) results[folder] = files
			}

			return results
		}

		async load(path: string) {
			const item = this.docFilesMap[path]

			if (!item) return ''

			if (this.docCache[path]) return this.docCache[path]

			const result = await item.load()
			this.docCache[path] = result
			return result
		}
	}

	docMgr = new DocMgr()
}

export { docMgr }
