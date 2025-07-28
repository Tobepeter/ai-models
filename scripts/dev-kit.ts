import { spawn, type ChildProcess } from 'child_process'
import { createWriteStream } from 'fs'
import { ensureDir } from 'fs-extra'
import { join } from 'path'
import { default as pino } from 'pino'
import { projectRoot } from './utils/env.js'

const logDir = join(projectRoot, 'temp/dev-kit')
const logLevel = 'info'
const killTimeout = 3000 // ms
const timeFormat = 'HH:MM:ss.l'
const colors = true
const killOnFail = true

interface Service {
	name: string
	cmd: string
	args: string[]
	cwd: string
}

interface Loggers {
	file: pino.Logger
	console: pino.Logger
}

/**
 * DevKit 开发环境管理器
 * 管理多个开发服务的启动、日志和生命周期
 */
class DevKit {
	private readonly procs: ChildProcess[] = []
	private readonly loggers = new Map<string, Loggers>()

	private readonly services: Service[] = [
		{ name: 'fe-dev', cmd: 'npm', args: ['run', 'dev'], cwd: projectRoot },
		{ name: 'api', cmd: 'npm', args: ['run', 'api:watch'], cwd: projectRoot },
		{ name: 'be-dev', cmd: 'make', args: ['dev'], cwd: join(projectRoot, 'backend') },
	]

	/* 创建文件和控制台日志对象 */
	private createLogger(svc: string): Loggers {
		const logFile = createWriteStream(join(logDir, `${svc}.log`), { flags: 'w' })

		const file = pino(
			{
				name: svc,
				level: logLevel,
				timestamp: pino.stdTimeFunctions.isoTime,
			},
			logFile
		)

		const console = pino(
			{
				name: svc,
				level: logLevel,
			},
			pino.transport({
				target: 'pino-pretty',
				options: {
					colorize: colors,
					translateTime: timeFormat,
					ignore: 'pid,hostname',
					messageFormat: `[${svc.toUpperCase()}] {msg}`,
				},
			})
		)

		return { file, console }
	}

	/* 初始化所有服务的日志对象 */
	private setupLoggers() {
		this.services.forEach((svc) => this.loggers.set(svc.name, this.createLogger(svc.name)))
	}

	/* 启动单个服务 */
	private startService(svc: Service): ChildProcess {
		const logs = this.loggers.get(svc.name)
		if (!logs) throw new Error(`Logger not found: ${svc.name}`)

		logs.console.info(`Starting ${svc.name}...`)
		logs.file.info(`Starting ${svc.name}...`)

		const proc = spawn(svc.cmd, svc.args, {
			cwd: svc.cwd,
			stdio: ['pipe', 'pipe', 'pipe'],
			shell: true,
		})

		this.procs.push(proc)

		proc.stdout?.on('data', (data) => {
			const out = data.toString().trim()
			if (out) {
				logs.console.info(out)
				logs.file.info(out)
			}
		})

		proc.stderr?.on('data', (data) => {
			const out = data.toString().trim()
			if (out) {
				logs.console.error(out)
				logs.file.error(out)
			}
		})

		proc.on('exit', (code, signal) => {
			const msg = `${svc.name} exited with code ${code} and signal ${signal}`
			logs.console.error(msg)
			logs.file.error(msg)

			if (code !== 0 && code !== null && killOnFail) {
				logs.console.error(`${svc.name} failed, killing other processes...`)
				this.killAll()
			}
		})

		proc.on('error', (err) => {
			const msg = `${svc.name} error: ${err.message}`
			logs.console.error(msg)
			logs.file.error(msg)
			this.killAll()
		})

		return proc
	}

	/* 杀死所有子进程 */
	private killAll() {
		this.procs.forEach((proc) => {
			if (proc && !proc.killed) {
				proc.kill('SIGTERM')
				setTimeout(() => {
					if (!proc.killed) proc.kill('SIGKILL')
				}, killTimeout)
			}
		})
	}

	private handleExit = () => {
		console.log('\n🛑 Shutting down dev-kit...')
		this.killAll()
		process.exit(0)
	}

	/* 设置退出信号监听 */
	private setupExitHandlers() {
		process.on('SIGINT', this.handleExit)
		process.on('SIGTERM', this.handleExit)
		process.on('exit', this.handleExit)
	}

	/* 启动所有开发服务 */
	async start() {
		await ensureDir(logDir)
		this.setupLoggers()
		this.setupExitHandlers()

		console.log('🚀 Starting dev-kit with pino logging...')
		console.log(`📁 Logs will be saved to: ${logDir}/`)

		this.services.forEach((svc) => this.startService(svc))
		console.log('✅ All services started! Press Ctrl+C to stop.')
	}
}
const devKit = new DevKit()

const main = () => {
	devKit.start()
}

main()
