import { Markdown } from '@/components/common/markdown'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { isDev } from '@/utils/env'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMount, useUpdate } from 'ahooks'
import { docMgr } from './doc-mgr'
import { DocFile } from './doc-types'
import { DocSidebar } from './doc-sidebar'

let Doc = () => <div>文档功能仅在开发环境可用</div>

if (isDev) {
	/**
	 * doc
	 *
	 * 开发环境展示项目内的文档
	 * 运行时方便阅读
	 */
	Doc = () => {
		const [searchParams, setSearchParams] = useSearchParams()
		const [selectedItem, setSelectedItem] = useState<DocFile | null>(null)
		const [content, setContent] = useState('')
		const [loading, setLoading] = useState(false)
		const update = useUpdate()
		const pathRef = useRef('')

		const docFilesMap = docMgr.docFilesMap || {}

		useMount(() => {
			docMgr.init()
			update()
		})

		const load = async (path: string) => {
			if (pathRef.current === path) return
			setLoading(true)
			setContent('')
			const content = await docMgr.load(path)
			pathRef.current = path
			setContent(content)
			setLoading(false)
		}

		// 选择文档
		const handleDocSelect = (path: string) => {
			const item = docFilesMap[path]
			setSelectedItem(item)
			const urlPath = encodeURIComponent(path)
			setSearchParams({ path: urlPath })
			load(path)
			update()
		}

		const autoSelect = () => {
			const path = Object.keys(docFilesMap)[0]
			const item = docFilesMap[path]
			if (item) {
				handleDocSelect(path)
			}
		}

		// 监听path变化
		useEffect(() => {
			// 其实这里是等 init 之后下一次 tick 进来
			const pathList = Object.keys(docFilesMap)
			if (!pathList.length) return
			const path = decodeURIComponent(searchParams.get('path') || '')
			const isVaild = pathList.some((item) => item === path)
			if (path && isVaild) handleDocSelect(path)
			else autoSelect()
		}, [searchParams, docFilesMap])

		return (
			<SidebarProvider>
				<DocSidebar selectedItem={selectedItem} onDocSelect={handleDocSelect} />
				<SidebarInset>
					<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
						<SidebarTrigger />
						<div className="flex flex-col">
							<h1 className="text-lg font-semibold">{selectedItem?.file || '选择文档'}</h1>
							{selectedItem && (
								<span className="text-xs text-muted-foreground">
									{selectedItem.folder} / {selectedItem.file}
								</span>
							)}
						</div>
					</header>
					<div className="p-4">
						{selectedItem ? (
							loading ? (
								<div className="text-center text-muted-foreground">加载文档内容中...</div>
							) : (
								<Markdown content={content} />
							)
						) : (
							<div className="text-center text-muted-foreground">请从侧边栏选择一个文档</div>
						)}
					</div>
				</SidebarInset>
			</SidebarProvider>
		)
	}
}

export { Doc }
