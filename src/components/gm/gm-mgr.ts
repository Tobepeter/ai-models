import { gmCfg } from './gm-cfg'

// WebSocket 消息类型
interface WSMessage {
	type: string
	processId?: string
	command?: string
	data?: string
	code?: number
	message?: string
}

// 进程日志接口
export interface ProcessLog {
	processId: string
	command: string
	logs: string[]
	status: 'running' | 'finished' | 'error'
}

// 端口状态接口
export interface PortStatus {
	port: number
	active: boolean
}

/**
 * GM WebSocket 管理器
 */
class GMManager {
	private ws: WebSocket | null = null
	private wsUrl = `ws://localhost:${gmCfg.gmPort}`
	private apiUrl = `http://localhost:${gmCfg.gmPort}/api`
	private reconnectTimer: NodeJS.Timeout | null = null
	private isConnecting = false

	// 事件回调
	private onConnChange?: (connected: boolean) => void
	private onProcUpdate?: (processes: ProcessLog[]) => void
	private onPortUpdate?: (ports: PortStatus[]) => void

	// 内部状态
	private logs: ProcessLog[] = []
	private ports: PortStatus[] = []

	setCallbacks(callbacks: { onConnChange?: (connected: boolean) => void; onProcUpdate?: (processes: ProcessLog[]) => void; onPortUpdate?: (ports: PortStatus[]) => void }) {
		this.onConnChange = callbacks.onConnChange
		this.onProcUpdate = callbacks.onProcUpdate
		this.onPortUpdate = callbacks.onPortUpdate
	}

	connect() {
		if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
			return
		}

		this.isConnecting = true
		console.log('🔗 正在连接 GM Server...')

		try {
			this.ws = new WebSocket(this.wsUrl)

			this.ws.onopen = () => {
				console.log('✅ GM Server 连接成功')
				this.isConnecting = false
				this.onConnChange?.(true)
				this.clearReconnectTimer()
			}

			this.ws.onmessage = (event) => {
				try {
					const message: WSMessage = JSON.parse(event.data)
					this.handleMessage(message)
				} catch (error) {
					console.error('❌ 解析 WebSocket 消息失败:', error)
				}
			}

			this.ws.onclose = () => {
				console.log('❌ GM Server 连接已断开')
				this.isConnecting = false
				this.onConnChange?.(false)
				this.scheduleReconnect()
			}

			this.ws.onerror = (error) => {
				console.error('❌ WebSocket 错误:', error)
				this.isConnecting = false
			}
		} catch (error) {
			console.error('❌ 创建 WebSocket 连接失败:', error)
			this.isConnecting = false
			this.scheduleReconnect()
		}
	}

	disconnect() {
		this.clearReconnectTimer()
		if (this.ws) {
			this.ws.close()
			this.ws = null
		}
		this.onConnChange?.(false)
	}

	execCmd(command: string) {
		if (!this.isConnected()) {
			console.error('❌ WebSocket 未连接')
			return
		}

		this.send({
			type: 'execute',
			command,
		})
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
		this.logs = []
		this.onProcUpdate?.(this.logs)
	}

	async fetchPortStatus() {
		try {
			const response = await fetch(`${this.apiUrl}/ports`)
			const data = await response.json()
			// 只显示配置中的端口
			const filteredPorts = data.ports.filter((port: PortStatus) => gmCfg.ports.includes(port.port))
			this.ports = filteredPorts
			this.onPortUpdate?.(this.ports)
		} catch (error) {
			console.error('❌ 获取端口状态失败:', error)
		}
	}

	isConnected() {
		return this.ws?.readyState === WebSocket.OPEN
	}

	getProcs() {
		return this.logs
	}

	getPorts() {
		return this.ports
	}

	private send(message: WSMessage) {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(message))
		}
	}

	private handleMessage(message: WSMessage) {
		const { type, processId, command, data, code } = message

		switch (type) {
			case 'start':
				if (processId && command) {
					this.logs.push({
						processId,
						command,
						logs: [`🚀 开始执行: ${command}`],
						status: 'running',
					})
					this.onProcUpdate?.(this.logs)
				}
				break

			case 'stdout':
			case 'stderr':
				if (processId && data) {
					this.logs = this.logs.map((p) => (p.processId === processId ? { ...p, logs: [...p.logs, data] } : p))
					this.onProcUpdate?.(this.logs)
				}
				break

			case 'close':
				if (processId) {
					this.logs = this.logs.map((p) =>
						p.processId === processId
							? {
									...p,
									logs: [...p.logs, `✅ 进程结束，退出码: ${code}`],
									status: code === 0 ? 'finished' : 'error',
								}
							: p
					)
					this.onProcUpdate?.(this.logs)
				}
				break

			case 'error':
				if (processId) {
					this.logs = this.logs.map((p) =>
						p.processId === processId
							? {
									...p,
									logs: [...p.logs, `❌ 错误: ${message.message}`],
									status: 'error',
								}
							: p
					)
					this.onProcUpdate?.(this.logs)
				}
				break

			case 'killed':
				if (processId) {
					this.logs = this.logs.map((p) =>
						p.processId === processId
							? {
									...p,
									logs: [...p.logs, `⏹️ 进程已终止`],
									status: 'finished',
								}
							: p
					)
					this.onProcUpdate?.(this.logs)
				}
				break

			case 'pong':
				// 心跳响应，暂时不处理
				break

			default:
				console.warn('❓ 未知的消息类型:', type)
		}
	}

	private scheduleReconnect() {
		this.clearReconnectTimer()
		this.reconnectTimer = setTimeout(() => {
			console.log('🔄 尝试重连 GM Server...')
			this.connect()
		}, 3000)
	}

	private clearReconnectTimer() {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = null
		}
	}
}

export const gmMgr = new GMManager()
