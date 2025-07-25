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

	// 重连状态
	private reconnectId = 0 // 重连 ID，用于终止重连
	private reconnectAttempts = 0 // 当前重连次数
	private currentDelay = gmCfg.reconnect.initialDelay // 当前延迟时间

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
				this.resetReconnectState()
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
		this.clearReconnect()
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

	/** 重置重连状态 */
	private resetReconnectState() {
		this.clearReconnect()
		this.reconnectAttempts = 0
		this.currentDelay = gmCfg.reconnect.initialDelay
	}

	/** 清除重连定时器并增加重连 ID */
	private clearReconnect() {
		this.reconnectId++ // 增加 ID，使之前的重连回调失效
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = null
		}
	}

	/** 计算带抖动的延迟时间 */
	private calculateDelayWithJitter(baseDelay: number): number {
		const jitter = Math.random() * gmCfg.reconnect.jitterMax * baseDelay
		return Math.floor(baseDelay + jitter)
	}

	/** 安排下次重连 */
	private scheduleReconnect() {
		// 检查是否超过最大重连次数
		if (gmCfg.reconnect.maxAttempts > 0 && this.reconnectAttempts >= gmCfg.reconnect.maxAttempts) {
			console.log(`❌ 已达到最大重连次数 (${gmCfg.reconnect.maxAttempts})，停止重连`)
			return
		}

		this.clearReconnect()
		this.reconnectAttempts++

		// 计算延迟时间（带抖动）
		const delayWithJitter = this.calculateDelayWithJitter(this.currentDelay)

		console.log(`🔄 第 ${this.reconnectAttempts} 次重连，${delayWithJitter}ms 后尝试...`)

		// 保存当前重连 ID
		const currentReconnectId = this.reconnectId

		this.reconnectTimer = setTimeout(() => {
			// 检查重连 ID 是否仍然有效（防止被 clearReconnect 取消）
			if (currentReconnectId !== this.reconnectId) {
				console.log('🚫 重连已被取消')
				return
			}

			console.log('🔄 尝试重连 GM Server...')
			this.connect()
		}, delayWithJitter)

		// 更新下次延迟时间（指数退避）
		this.currentDelay = Math.min(this.currentDelay * gmCfg.reconnect.multiplier, gmCfg.reconnect.maxDelay)
	}
}

export const gmMgr = new GMManager()
