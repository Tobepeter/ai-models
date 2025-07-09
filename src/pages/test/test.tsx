import { useRequest } from 'ahooks'
import { TestShadcn } from './components/TestShadcn'

export const Test = () => {
	const { data, loading } = useRequest(() => Promise.resolve('欢迎来到测试页面！'), {
		ready: true,
	})

	return (
		<div className="container mx-auto p-6 space-y-8">
			<div className="text-center space-y-4">
				<h1 className="text-4xl font-bold">shadcn/ui 组件展示</h1>
				<p className="text-lg text-muted-foreground">{loading ? '加载中...' : data}</p>
			</div>

			<TestShadcn />
		</div>
	)
}
