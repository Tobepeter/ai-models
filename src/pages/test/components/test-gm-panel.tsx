import { useState } from 'react'
import { GMPanel, GMConfigItem } from '@/components/common/gm-panel'

/**
 * GM Panel 测试组件
 */
export const TestGMPanel = () => {
	const [serverStatus, setServerStatus] = useState<'stopped' | 'starting' | 'running'>('stopped')
	const [debugMode, setDebugMode] = useState(false)
	const [autoRefresh, setAutoRefresh] = useState(true)
	const [buildProgress, setBuildProgress] = useState(0)
	const [isBuilding, setIsBuilding] = useState(false)

	// 模拟服务器启动
	const handleStartServer = async () => {
		if (serverStatus !== 'stopped') return

		setServerStatus('starting')
		// 模拟启动过程
		setTimeout(() => {
			setServerStatus('running')
		}, 2000)
	}

	// 模拟停止服务器
	const handleStopServer = () => {
		setServerStatus('stopped')
	}

	// 模拟构建过程
	const handleBuild = async () => {
		if (isBuilding) return

		setIsBuilding(true)
		setBuildProgress(0)

		// 模拟构建进度
		const interval = setInterval(() => {
			setBuildProgress((prev) => {
				if (prev >= 100) {
					clearInterval(interval)
					setIsBuilding(false)
					return 100
				}
				return prev + 10
			})
		}, 200)
	}

	// 模拟重启应用
	const handleRestart = () => {
		console.log('重启应用...')
	}

	// 模拟清理缓存
	const handleClearCache = () => {
		console.log('清理缓存...')
	}

	// 模拟部署
	const handleDeploy = () => {
		console.log('开始部署...')
	}

	// GM Panel 配置
	const gmConfig: GMConfigItem[] = [
		// 服务器状态显示
		{
			type: 'badge',
			label: '服务器状态',
			value: serverStatus === 'running' ? '运行中' : serverStatus === 'starting' ? '启动中' : '已停止',
		},

		// 服务器控制按钮
		{
			type: 'button',
			label: serverStatus === 'starting' ? '启动中...' : '启动服务器',
			onClick: handleStartServer,
			disabled: serverStatus !== 'stopped',
			loading: serverStatus === 'starting',
		},

		{
			type: 'button',
			label: '停止服务器',
			onClick: handleStopServer,
			disabled: serverStatus === 'stopped',
		},

		// 开关控件
		{
			type: 'switch',
			label: '调试模式',
			value: debugMode,
			onChange: setDebugMode,
		},

		{
			type: 'switch',
			label: '自动刷新',
			value: autoRefresh,
			onChange: setAutoRefresh,
		},

		// 构建相关
		{
			type: 'button',
			label: isBuilding ? `构建中 ${buildProgress}%` : '构建项目',
			onClick: handleBuild,
			disabled: isBuilding,
			loading: isBuilding,
		},

		// 信息显示
		{
			type: 'badge',
			label: '端口',
			value: '4755',
		},

		{
			type: 'badge',
			label: '环境',
			value: 'development',
		},

		// 操作按钮
		{
			type: 'button',
			label: '重启应用',
			onClick: handleRestart,
		},

		{
			type: 'button',
			label: '清理缓存',
			onClick: handleClearCache,
		},

		{
			type: 'button',
			label: '部署',
			onClick: handleDeploy,
		},

		// 自定义渲染示例
		{
			type: 'custom',
			renderer: () => (
				<div className="p-3 bg-muted rounded text-xs w-full">
					<div className="flex justify-between">
						<div>内存: 45%</div>
						<div>CPU: 23%</div>
						<div>磁盘: 78%</div>
					</div>
				</div>
			),
		},
	]

	return (
		<div className="space-y-8">
			<div className="text-center p-8 bg-muted/50 rounded-lg">
				<h2 className="text-lg font-semibold mb-2">GM Panel 测试</h2>
				<p className="text-sm text-muted-foreground">这是一个可拖拽的 GM 面板，支持各种配置项类型。</p>
			</div>

			<GMPanel title="GM" config={gmConfig} defaultPos={{ x: 300, y: 100 }} />
		</div>
	)
}
