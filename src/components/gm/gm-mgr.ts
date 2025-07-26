import { gmCfg } from './gm-cfg'
import { useGMStore, type GMWsData, type GMPortStatus } from './gm-store'

/**
 * GM WebSocket 管理器
 */
class GMManager {
	private ws: WebSocket | null = null
	private wsUrl = `ws://localhost:${gmCfg.gmPort}`
	private apiUrl = `http://localhost:${gmCfg.gmPort}/api`
	private reconnectTimer = -1
	private getStore() {
		return useGMStore.getState()
	}

	connect() {
		const store = this.getStore()

		if (this.ws?.readyState === WebSocket.OPEN || store.connectionStatus === 'connecting') {
			return
		}

		// 如果是主动连接，清除重连定时器
		this.clearReconnectTimer()

		store.setData({ connectionStatus: 'connecting' })
		console.log('🔗 正在连接 GM Server...')

		try {
			this.ws = new WebSocket(this.wsUrl)

			this.ws.onopen = () => {
				console.log('✅ GM Server 连接成功')
				const store = this.getStore()
				store.setData({
					connectionStatus: 'connected',
					reconnectAttempts: 0,
				})
			}

			this.ws.onmessage = (event) => {
				try {
					const message: GMWsData = JSON.parse(event.data)
					this.handleMessage(message)
				} catch (error) {
					console.error('❌ 解析 WebSocket 消息失败:', error)
				}
			}

			this.ws.onclose = () => {
				console.log('❌ GM Server 连接已断开')
				const store = this.getStore()
				store.setData({
					connectionStatus: 'disconnected',
				})
				this.scheduleReconnect()
			}

			this.ws.onerror = (error) => {
				console.error('❌ WebSocket 错误:', error)
				const store = this.getStore()
				store.setData({ connectionStatus: 'disconnected' })
			}
		} catch (error) {
			console.error('❌ 创建 WebSocket 连接失败:', error)
			const store = this.getStore()
			store.setData({ connectionStatus: 'disconnected' })
			this.scheduleReconnect()
		}
	}

	disconnect() {
		this.clearReconnectTimer()
		if (this.ws) {
			this.ws.close()
			this.ws = null
		}
		const store = this.getStore()
		store.setData({ connectionStatus: 'disconnected' })
	}

	execCmd(command: string) {
		if (!this.isConnected()) {
			console.error('❌ WebSocket 未连接')
			return
		}

		this.send({ type: 'execute', command })
	}

	killProc(procId: string) {
		if (!this.isConnected()) {
			console.error('❌ WebSocket 未连接')
			return
		}

		this.send({
			type: 'kill',
			processId: procId,
		})
	}

	clearLogs() {
		const store = this.getStore()
		store.setData({ processes: [] })
	}

	async fetchPortStatus() {
		try {
			const response = await fetch(`${this.apiUrl}/ports`)
			const data = await response.json()
			// 只显示配置中的端口
			const filteredPorts = data.ports.filter((port: GMPortStatus) => gmCfg.ports.includes(port.port))
			const store = this.getStore()
			store.setData({ ports: filteredPorts })
		} catch (error) {
			console.error('❌ 获取端口状态失败:', error)
		}
	}

	isConnected() {
		return this.ws?.readyState === WebSocket.OPEN
	}

	private send(message: GMWsData) {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(message))
		}
	}

	private handleMessage(message: GMWsData) {
		const { type, processId, command, data, code } = message
		const store = this.getStore()

		switch (type) {
			case 'start':
				if (processId && command) {
					store.addProcess({
						processId,
						command,
						logs: [`🚀 开始执行: ${command}`],
						status: 'running',
					})
				}
				break

			case 'stdout':
			case 'stderr':
				if (processId && data) {
					store.updateProcess(processId, {
						logs: [...(store.processes.find((p) => p.processId === processId)?.logs || []), data],
					})
				}
				break

			case 'close':
				if (processId) {
					const process = store.processes.find((p) => p.processId === processId)
					if (process) {
						store.updateProcess(processId, {
							logs: [...process.logs, `✅ 进程结束，退出码: ${code}`],
							status: code === 0 ? 'finished' : 'error',
						})
					}
				}
				break

			case 'error':
				if (processId) {
					const process = store.processes.find((p) => p.processId === processId)
					if (process) {
						store.updateProcess(processId, {
							logs: [...process.logs, `❌ 错误: ${message.message}`],
							status: 'error',
						})
					}
				}
				break

			case 'killed':
				if (processId) {
					const process = store.processes.find((p) => p.processId === processId)
					if (process) {
						store.updateProcess(processId, {
							logs: [...process.logs, `⏹️ 进程已终止`],
							status: 'finished',
						})
					}
				}
				break

			case 'pong':
				// 心跳响应，暂时不处理
				break

			default:
				console.warn('❓ 未知的消息类型:', type)
		}
	}

	/** 清除重连定时器 */
	private clearReconnectTimer() {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = null
		}
	}

	/** 安排下次重连 */
	private scheduleReconnect() {
		const store = this.getStore()

		// 防止重复重连
		if (store.connectionStatus === 'reconnecting') {
			return
		}

		// 检查是否超过最大重连次数
		if (store.reconnectAttempts >= gmCfg.reconnect.maxAttempts) {
			console.log(`❌ 已达到最大重连次数 (${gmCfg.reconnect.maxAttempts})，停止重连`)
			return
		}

		store.setData({
			connectionStatus: 'reconnecting',
			reconnectAttempts: store.reconnectAttempts + 1,
		})

		const attemptNumber = store.reconnectAttempts

		console.log(`🔄 第 ${attemptNumber} 次重连，${gmCfg.reconnect.delay}ms 后尝试...`)

		this.reconnectTimer = setTimeout(() => {
			console.log('🔄 尝试重连 GM Server...')
			this.connect()
		}, gmCfg.reconnect.delay) as any
	}

	/** 手动重连 */
	manualReconnect() {
		const store = this.getStore()
		this.clearReconnectTimer()
		store.setData({
			reconnectAttempts: 0,
			connectionStatus: 'disconnected',
		})
		this.connect()
	}
}

export const gmMgr = new GMManager()
