import { isDev } from '@/utils/env'
import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TestDummy } from './components/test-dummy'
import { TestImagePreview } from './components/test-image-preview'
import { TestShadcn } from './components/test-shadcn'
import { TestVideoPreview } from './components/test-video-preview'
import { TestSilicon } from './components/test-silicon'
import { TestAIAgent } from './components/test-ai-agent'

let Test = () => <div>Test</div>

if (isDev) {
	Test = () => {
		const [searchParams, setSearchParams] = useSearchParams()

		const config = {
			shadcn: <TestShadcn />,
			dummy: <TestDummy />,
			image: <TestImagePreview />,
			video: <TestVideoPreview />,
			silicon: <TestSilicon />,
			aiAgent: <TestAIAgent />,
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
			<div className="flex h-screen">
				{/* 侧边栏 */}
				<div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
					<h2 className="text-lg font-semibold mb-4">测试用例</h2>
					<div className="space-y-2">
						{keys.map((key) => (
							<Button
								key={key}
								variant={selectedKey === key ? 'default' : 'ghost'}
								className={cn('w-full justify-start', selectedKey === key && 'bg-blue-600 hover:bg-blue-700')}
								onClick={() => handleTestChange(key)}
							>
								{key}
							</Button>
						))}
					</div>
				</div>

				{/* 主内容区域 */}
				<div className="flex-1">{config[selectedKey]}</div>
			</div>
		)
	}
}

export { Test }
