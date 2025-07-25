import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'

interface PortStatus {
	port: number
	active: boolean
}

/**
 * GM Server 测试组件
 */
export const TestGMServer = () => {
	const [ports, setPorts] = useState<PortStatus[]>([])
	const [commands, setCommands] = useState<string[]>([])
	const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
	const [logs, setLogs] = useState<string[]>([])

	// 获取端口状态
	const fetchPorts = async () => {
		try {
			const response = await fetch('http://localhost:4755/api/ports')
			const data = await response.json()
			setPorts(data.ports)
		} catch (error) {
			console.error('获取端口状态失败:', error)
		}
	}

	// 获取命令列表
	const fetchCommands = async () => {
		try {
			const response = await fetch('http://localhost:4755/api/commands')
			const data = await response.json()
			setCommands(data.commands)
		} catch (error) {
			console.error('获取命令列表失败:', error)
		}
	}

	// 测试 WebSocket 连接
	const testWebSocket = () => {
		setWsStatus('connecting')
		setLogs([])
		
		const ws = new WebSocket('ws://localhost:4755')
		
		ws.onopen = () => {
			setWsStatus('connected')
			setLogs(prev => [...prev, '✅ WebSocket 连接成功'])
			
			// 发送 ping 测试
			ws.send(JSON.stringify({ type: 'ping' }))
		}
		
		ws.onmessage = (event) => {
			const message = JSON.parse(event.data)
			setLogs(prev => [...prev, `📨 收到消息: ${JSON.stringify(message)}`])
		}
		
		ws.onclose = () => {
			setWsStatus('disconnected')
			setLogs(prev => [...prev, '❌ WebSocket 连接已断开'])
		}
		
		ws.onerror = (error) => {
			setWsStatus('disconnected')
			setLogs(prev => [...prev, `❌ WebSocket 错误: ${error}`])
		}
		
		// 5秒后关闭连接
		setTimeout(() => {
			if (ws.readyState === WebSocket.OPEN) {
				ws.close()
			}
		}, 5000)
	}

	// 测试命令执行
	const testCommand = () => {
		setLogs([])
		
		const ws = new WebSocket('ws://localhost:4755')
		
		ws.onopen = () => {
			setLogs(prev => [...prev, '✅ 开始测试命令执行'])
			
			// 执行一个简单的命令
			ws.send(JSON.stringify({
				type: 'execute',
				command: 'npm run format'
			}))
		}
		
		ws.onmessage = (event) => {
			const message = JSON.parse(event.data)
			setLogs(prev => [...prev, `📨 ${message.type}: ${JSON.stringify(message)}`])
		}
		
		ws.onclose = () => {
			setLogs(prev => [...prev, '✅ 命令测试完成'])
		}
	}

	useEffect(() => {
		fetchPorts()
		fetchCommands()
		
		// 定时刷新端口状态
		const interval = setInterval(fetchPorts, 3000)
		return () => clearInterval(interval)
	}, [])

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>GM Server 测试</CardTitle>
					<CardDescription>测试 GM Server 的各项功能</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* 端口状态 */}
					<div>
						<h3 className="text-sm font-medium mb-2">端口状态</h3>
						<div className="flex gap-2 flex-wrap">
							{ports.map(port => (
								<Badge 
									key={port.port} 
									variant={port.active ? 'default' : 'secondary'}
								>
									{port.port}: {port.active ? '活跃' : '空闲'}
								</Badge>
							))}
						</div>
					</div>

					{/* 支持的命令 */}
					<div>
						<h3 className="text-sm font-medium mb-2">支持的命令 ({commands.length})</h3>
						<div className="grid grid-cols-2 gap-1 text-xs">
							{commands.map(cmd => (
								<div key={cmd} className="p-1 bg-muted rounded">
									{cmd}
								</div>
							))}
						</div>
					</div>

					{/* 测试按钮 */}
					<div className="flex gap-2">
						<Button onClick={testWebSocket} disabled={wsStatus === 'connecting'}>
							{wsStatus === 'connecting' ? '连接中...' : 'WebSocket 测试'}
						</Button>
						<Button onClick={testCommand} variant="outline">
							命令执行测试
						</Button>
						<Button onClick={fetchPorts} variant="outline" size="sm">
							刷新端口
						</Button>
					</div>

					{/* WebSocket 状态 */}
					<div className="flex items-center gap-2">
						<span className="text-sm">WebSocket 状态:</span>
						<Badge variant={
							wsStatus === 'connected' ? 'default' :
							wsStatus === 'connecting' ? 'secondary' : 'destructive'
						}>
							{wsStatus}
						</Badge>
					</div>

					{/* 日志输出 */}
					{logs.length > 0 && (
						<div>
							<h3 className="text-sm font-medium mb-2">测试日志</h3>
							<div className="bg-muted p-3 rounded text-xs space-y-1 max-h-40 overflow-y-auto">
								{logs.map((log, idx) => (
									<div key={idx}>{log}</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
