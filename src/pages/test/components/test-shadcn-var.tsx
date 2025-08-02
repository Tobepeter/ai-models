import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

/**
 * shadcn主题变量展示组件
 */
const TestShadcnVar = () => {
	// 基础颜色变量
	const colorVars = [
		{ name: 'background', desc: '背景色' },
		{ name: 'foreground', desc: '前景文字色' },
		{ name: 'card', desc: '卡片背景色' },
		{ name: 'card-foreground', desc: '卡片文字色' },
		{ name: 'popover', desc: '弹窗背景色' },
		{ name: 'popover-foreground', desc: '弹窗文字色' },
		{ name: 'primary', desc: '主色调' },
		{ name: 'primary-foreground', desc: '主色调文字色' },
		{ name: 'secondary', desc: '次要色调' },
		{ name: 'secondary-foreground', desc: '次要色调文字色' },
		{ name: 'muted', desc: '柔和色调' },
		{ name: 'muted-foreground', desc: '柔和文字色' },
		{ name: 'accent', desc: '强调色' },
		{ name: 'accent-foreground', desc: '强调色文字色' },
		{ name: 'destructive', desc: '危险色（红色）' },
	]

	// 边框和交互变量
	const interactionVars = [
		{ name: 'border', desc: '边框色' },
		{ name: 'input', desc: '输入框背景色' },
		{ name: 'ring', desc: '焦点环颜色' },
	]

	// 图表颜色变量
	const chartVars = [
		{ name: 'chart-1', desc: '图表颜色1' },
		{ name: 'chart-2', desc: '图表颜色2' },
		{ name: 'chart-3', desc: '图表颜色3' },
		{ name: 'chart-4', desc: '图表颜色4' },
		{ name: 'chart-5', desc: '图表颜色5' },
	]

	// 侧边栏变量
	const sidebarVars = [
		{ name: 'sidebar', desc: '侧边栏背景色' },
		{ name: 'sidebar-foreground', desc: '侧边栏文字色' },
		{ name: 'sidebar-primary', desc: '侧边栏主色' },
		{ name: 'sidebar-primary-foreground', desc: '侧边栏主色文字' },
		{ name: 'sidebar-accent', desc: '侧边栏强调色' },
		{ name: 'sidebar-accent-foreground', desc: '侧边栏强调色文字' },
		{ name: 'sidebar-border', desc: '侧边栏边框色' },
		{ name: 'sidebar-ring', desc: '侧边栏焦点环' },
	]

	// 半径变量
	const radiusVars = [
		// NOTE：必须完整的var开头，否则tailwind会删掉定义
		{ name: 'radius', desc: '基础圆角', cssVar: 'var(--radius)' },
		{ name: 'radius-sm', desc: '小圆角', cssVar: 'var(--radius-sm)' },
		{ name: 'radius-md', desc: '中圆角', cssVar: 'var(--radius-md)' },
		{ name: 'radius-lg', desc: '大圆角', cssVar: 'var(--radius-lg)' },
		{ name: 'radius-xl', desc: '超大圆角', cssVar: 'var(--radius-xl)' },
	]

	const ColorBox = (props: { varName: string; desc: string }) => {
		const { varName, desc } = props
		return (
			<div className="flex items-center gap-3 p-3 rounded border" data-slot="color-box">
				<div className="w-12 h-12 rounded border-2 border-border shrink-0" style={{ backgroundColor: `var(--${varName})` }} />
				<div className="flex-1 min-w-0">
					<div className="font-mono text-sm font-medium">--{varName}</div>
					<div className="text-sm text-muted-foreground">{desc}</div>
				</div>
			</div>
		)
	}

	const RadiusBox = (props: { name: string; desc: string; cssVar: string }) => {
		const { name, desc, cssVar } = props
		return (
			<div className="flex items-center gap-3 p-3 rounded border" data-slot="radius-box">
				<div className="w-12 h-12 bg-primary shrink-0" style={{ borderRadius: cssVar }} />
				<div className="flex-1 min-w-0">
					<div className="font-mono text-sm font-medium">--{name}</div>
					<div className="text-sm text-muted-foreground">{desc}</div>
				</div>
			</div>
		)
	}

	return (
		<div className="max-w-6xl mx-auto space-y-6" data-slot="test-shadcn-var">
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold">shadcn 主题变量展示</h1>
				<p className="text-muted-foreground">展示项目中使用的所有shadcn主题CSS变量</p>
				<Badge variant="outline">支持亮色/暗色主题切换</Badge>
			</div>

			{/* 基础颜色 */}
			<Card>
				<CardHeader>
					<CardTitle>基础颜色变量</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{colorVars.map(({ name, desc }) => (
							<ColorBox key={name} varName={name} desc={desc} />
						))}
					</div>
				</CardContent>
			</Card>

			{/* 边框和交互 */}
			<Card>
				<CardHeader>
					<CardTitle>边框和交互变量</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{interactionVars.map(({ name, desc }) => (
							<ColorBox key={name} varName={name} desc={desc} />
						))}
					</div>
				</CardContent>
			</Card>

			{/* 图表颜色 */}
			<Card>
				<CardHeader>
					<CardTitle>图表颜色变量</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{chartVars.map(({ name, desc }) => (
							<ColorBox key={name} varName={name} desc={desc} />
						))}
					</div>
				</CardContent>
			</Card>

			{/* 侧边栏变量 */}
			<Card>
				<CardHeader>
					<CardTitle>侧边栏变量</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{sidebarVars.map(({ name, desc }) => (
							<ColorBox key={name} varName={name} desc={desc} />
						))}
					</div>
				</CardContent>
			</Card>

			{/* 圆角变量 */}
			<Card>
				<CardHeader>
					<CardTitle>圆角变量</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{radiusVars.map(({ name, desc, cssVar }) => (
							<RadiusBox key={name} name={name} desc={desc} cssVar={cssVar} />
						))}
					</div>
				</CardContent>
			</Card>

			{/* 使用示例 */}
			<Card>
				<CardHeader>
					<CardTitle>使用示例</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<h3 className="font-medium">实际效果展示：</h3>
						<div className="flex flex-wrap gap-2">
							<div className="bg-primary text-primary-foreground px-3 py-2 rounded">主色调</div>
							<div className="bg-secondary text-secondary-foreground px-3 py-2 rounded">次要色</div>
							<div className="bg-muted text-muted-foreground px-3 py-2 rounded">柔和色</div>
							<div className="bg-accent text-accent-foreground px-3 py-2 rounded">强调色</div>
							<div className="bg-destructive text-white px-3 py-2 rounded">危险色</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default TestShadcnVar
