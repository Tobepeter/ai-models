import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { isDev } from '@/utils/env'
import { useEffect, useState, ComponentType } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMount, useUpdate } from 'ahooks'
import { testMgr } from './test-mgr'

let Test = () => <div data-slot="test">Test</div>

if (isDev) {
	Test = () => {
		const [searchParams, setSearchParams] = useSearchParams()
		const [selectedComponent, setSelectedComponent] = useState<ComponentType | null>(null)
		const [loading, setLoading] = useState(false)
		const [keys, setKeys] = useState<string[]>([])
		const [searchTerm, setSearchTerm] = useState('')
		const update = useUpdate()

		useMount(() => {
			testMgr.init()
			setKeys(testMgr.getKeys())
			update()
		})
		const currTest = searchParams.get('t')

		// 过滤测试用例
		const filteredKeys = keys.filter(key => 
			key.toLowerCase().includes(searchTerm.toLowerCase())
		)

		// 确定当前选中的测试用例
		const selectedKey = currTest && filteredKeys.includes(currTest) ? currTest : filteredKeys[0]

		// 加载组件
		const loadComponent = async (key: string) => {
			if (!key) return
			setLoading(true)
			try {
				const Component = await testMgr.load(key)
				setSelectedComponent(() => Component)
			} catch (error) {
				console.error('Failed to load component:', error)
				setSelectedComponent(null)
			} finally {
				setLoading(false)
			}
		}

		// 初始化时同步 URL 参数
		useEffect(() => {
			if (!currTest || !filteredKeys.includes(currTest)) {
				if (filteredKeys[0]) {
					setSearchParams({ t: filteredKeys[0] })
				}
			} else {
				loadComponent(currTest)
			}
		}, [currTest, keys.join(','), searchTerm, setSearchParams])

		// 切换测试用例
		const handleTestChange = (key: string) => {
			setSearchParams({ t: key })
			loadComponent(key)
		}

		const renderComponent = () => {
			if (loading) return <div className="p-4">Loading...</div>
			if (!selectedComponent) return <div className="p-4">Component not found</div>
			const Component = selectedComponent
			return <Component />
		}

		return (
			<SidebarProvider>
				<Sidebar>
					<SidebarHeader>
						<div className="flex items-center gap-2">
							<h2 className="text-lg font-semibold">测试用例</h2>
							<Input 
								placeholder="搜索..." 
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="flex-1"
							/>
						</div>
					</SidebarHeader>
					<SidebarContent>
						<SidebarMenu>
							{filteredKeys.map((key) => (
								<SidebarMenuItem key={key}>
									<SidebarMenuButton isActive={selectedKey === key} onClick={() => handleTestChange(key)}>
										{key}
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarContent>
				</Sidebar>
				{/* NOTE: flex 1 默认 min-w 是 auto，尽可能文本不换行，但是 w-0，子元素会换行适应容器宽度 */}
				<SidebarInset className="min-w-0">
					<header className="flex h-16 shrink-0 items-center gap-2 border-b px-2">
						<SidebarTrigger />
						<h1 className="text-lg font-semibold">{selectedKey} 测试</h1>
					</header>
					<div>{renderComponent()}</div>
				</SidebarInset>
			</SidebarProvider>
		)
	}
}

export { Test }
