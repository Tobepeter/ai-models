import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar'
import { isDev } from '@/utils/env'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TestAIAgent } from './components/test-ai-agent'
import { TestChatMsg } from './components/test-chat-msg'
import { TestStreamText } from './components/test-stream-text'
import { TestCustom } from './components/test-custom'
import { TestDummy } from './components/test-dummy'
import { TestImgPreview } from './components/test-img-preview'
import { TestImgPrevSmart } from './components/test-img-prev-smart'
import { TestMarkdown } from './components/test-markdown'
import { TestMarkdownMermaid } from './components/test-markdown-mermaid'
import { TestMarkdownStreaming } from './components/test-markdown-streaming'
import { TestShadcn } from './components/test-shadcn'
import { TestShimmer } from './components/test-shimmer'
import { TestShimmerOp } from './components/test-shimmer-op'
import { TestTwBreakpoint } from './components/test-tw-breakpoint'
import { TestVideoPreview } from './components/test-video-preview'
import { TestGrid } from './components/test-grid'
import { TestMultiSelector } from './components/test-multi-selector'
import { TestOSS } from './components/test-oss'
import { TestUserAvatar } from './components/test-user-avatar'

let Test = () => <div>Test</div>

if (isDev) {
	Test = () => {
		const [searchParams, setSearchParams] = useSearchParams()

		const config = {
			custom: <TestCustom />,
			shadcn: <TestShadcn />,
			multiSelector: <TestMultiSelector />,
			dummy: <TestDummy />,
			image: <TestImgPreview />,
			imageSmartSizing: <TestImgPrevSmart />,
			userAvatar: <TestUserAvatar />,
			video: <TestVideoPreview />,
			oss: <TestOSS />,
			aiAgent: <TestAIAgent />,
			chatMsg: <TestChatMsg />,
			markdown: <TestMarkdown />,
			mermaid: <TestMarkdownMermaid />,
			markdownStreaming: <TestMarkdownStreaming />,
			shimmer: <TestShimmer />,
			shimmerOp: <TestShimmerOp />,
			streamText: <TestStreamText />,
			twBreakpoint: <TestTwBreakpoint />,
			grid: <TestGrid />,
		} as const

		const keys = Object.keys(config) as Array<keyof typeof config>
		const currTest = searchParams.get('test')

		// 确定当前选中的测试用例
		const selectedKey = currTest && keys.includes(currTest as keyof typeof config) ? (currTest as keyof typeof config) : keys[0]

		// 初始化时同步 URL 参数
		useEffect(() => {
			if (!currTest || !keys.includes(currTest as keyof typeof config)) {
				setSearchParams({ test: keys[0] })
			}
		}, [currTest, keys, setSearchParams])

		// 切换测试用例
		const handleTestChange = (key: keyof typeof config) => {
			setSearchParams({ test: key })
		}

		return (
			<SidebarProvider>
				<Sidebar>
					<SidebarHeader>
						<h2 className="text-lg font-semibold">测试用例</h2>
					</SidebarHeader>
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel>测试组件</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{keys.map((key) => (
										<SidebarMenuItem key={key}>
											<SidebarMenuButton isActive={selectedKey === key} onClick={() => handleTestChange(key)}>
												{key}
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
				</Sidebar>
				{/* NOTE: flex 1 默认 min-w 是 auto，尽可能文本不换行，但是 w-0，子元素会换行适应容器宽度 */}
				<SidebarInset className="min-w-0">
					<header className="flex h-16 shrink-0 items-center gap-2 border-b px-2">
						<SidebarTrigger />
						<h1 className="text-lg font-semibold">{selectedKey} 测试</h1>
					</header>
					<div>{config[selectedKey]}</div>
				</SidebarInset>
			</SidebarProvider>
		)
	}
}

export { Test }
