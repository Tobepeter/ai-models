import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { spawn, ChildProcess } from 'child_process'
import cors from 'cors'
import net from 'net'

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

const PORT = 4755

// 存储正在运行的进程
const runningProcesses = new Map<string, ChildProcess>()

// 支持的命令列表
const ALLOWED_COMMANDS = [
	'npm run dev',
	'npm run build', 
	'npm run preview',
	'npm run mock-server',
	'npm run oss-server',
	'npm run format',
	'npm run gen-qrcode',
	'npm run deploy',
	'npm run deploy:be',
	'npm run deploy:nginx',
	'npm run secrets:sync',
	'npm run secrets:encrypt',
	'npm run secrets:decrypt',
	'npm run tog-focus'
]

app.use(cors())
app.use(express.json())

// 检查端口是否活跃
function checkPort(port: number): Promise<boolean> {
	return new Promise((resolve) => {
		const socket = new net.Socket()
		
		socket.setTimeout(1000)
		socket.on('connect', () => {
			socket.destroy()
			resolve(true)
		})
		
		socket.on('timeout', () => {
			socket.destroy()
			resolve(false)
		})
		
		socket.on('error', () => {
			resolve(false)
		})
		
		socket.connect(port, 'localhost')
	})
}

// 获取端口状态
app.get('/api/ports', async (req, res) => {
	const ports = [5173, 3000, 6006, 4755]
	const statuses = await Promise.all(
		ports.map(async (port) => ({
			port,
			active: await checkPort(port)
		}))
	)
	
	res.json({ ports: statuses })
})

// 获取支持的命令列表
app.get('/api/commands', (req, res) => {
	res.json({ commands: ALLOWED_COMMANDS })
})

// WebSocket 连接处理
wss.on('connection', (ws) => {
	console.log('🔗 GM Panel 客户端已连接')
	
	ws.on('message', (data) => {
		try {
			const message = JSON.parse(data.toString())
			handleMessage(ws, message)
		} catch (error) {
			ws.send(JSON.stringify({
				type: 'error',
				message: '无效的消息格式'
			}))
		}
	})
	
	ws.on('close', () => {
		console.log('❌ GM Panel 客户端已断开')
	})
})

// 处理 WebSocket 消息
function handleMessage(ws: any, message: any) {
	const { type, command, processId } = message
	
	switch (type) {
		case 'execute':
			executeCommand(ws, command)
			break
			
		case 'kill':
			killProcess(ws, processId)
			break
			
		case 'ping':
			ws.send(JSON.stringify({ type: 'pong' }))
			break
			
		default:
			ws.send(JSON.stringify({
				type: 'error',
				message: `未知的消息类型: ${type}`
			}))
	}
}

// 执行命令
function executeCommand(ws: any, command: string) {
	if (!ALLOWED_COMMANDS.includes(command)) {
		ws.send(JSON.stringify({
			type: 'error',
			message: `不支持的命令: ${command}`
		}))
		return
	}
	
	const processId = Date.now().toString()
	const [cmd, ...args] = command.split(' ')
	
	ws.send(JSON.stringify({
		type: 'start',
		processId,
		command
	}))
	
	const childProcess = spawn(cmd, args, {
		cwd: process.cwd(),
		stdio: ['pipe', 'pipe', 'pipe']
	})
	
	runningProcesses.set(processId, childProcess)
	
	// 处理标准输出
	childProcess.stdout?.on('data', (data) => {
		ws.send(JSON.stringify({
			type: 'stdout',
			processId,
			data: data.toString()
		}))
	})
	
	// 处理错误输出
	childProcess.stderr?.on('data', (data) => {
		ws.send(JSON.stringify({
			type: 'stderr',
			processId,
			data: data.toString()
		}))
	})
	
	// 处理进程结束
	childProcess.on('close', (code) => {
		runningProcesses.delete(processId)
		ws.send(JSON.stringify({
			type: 'close',
			processId,
			code
		}))
	})
	
	// 处理进程错误
	childProcess.on('error', (error) => {
		runningProcesses.delete(processId)
		ws.send(JSON.stringify({
			type: 'error',
			processId,
			message: error.message
		}))
	})
}

// 终止进程
function killProcess(ws: any, processId: string) {
	const process = runningProcesses.get(processId)
	if (process) {
		process.kill('SIGTERM')
		runningProcesses.delete(processId)
		ws.send(JSON.stringify({
			type: 'killed',
			processId
		}))
	} else {
		ws.send(JSON.stringify({
			type: 'error',
			message: `进程 ${processId} 不存在`
		}))
	}
}

// 启动服务器
server.listen(PORT, () => {
	console.log(`🚀 GM Server running on http://localhost:${PORT}`)
	console.log(`📡 WebSocket server ready for connections`)
})

// 优雅关闭
process.on('SIGINT', () => {
	console.log('\n🛑 正在关闭 GM Server...')
	
	// 终止所有运行中的进程
	runningProcesses.forEach((process, processId) => {
		console.log(`⏹️ 终止进程: ${processId}`)
		process.kill('SIGTERM')
	})
	
	server.close(() => {
		console.log('✅ GM Server 已关闭')
		process.exit(0)
	})
})
