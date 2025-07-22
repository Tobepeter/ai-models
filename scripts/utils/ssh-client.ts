import { NodeSSH } from 'node-ssh'
import { homedir } from 'os'
import path from 'path'
import { serverHost, sshPrivateKey, verbose } from './env'

const privateKeyPath = path.join(homedir(), '.ssh', 'id_rsa')

/**
 * SSH 客户端单例
 * 自动从环境变量读取配置，支持 verbose 模式打印命令执行详情
 */
class SSHClient {
	ssh = new NodeSSH()
	isConnected = false

	async connect() {
		if (this.isConnected) {
			if (verbose) {
				console.log('🔗 SSH 已连接，跳过重复连接')
			}
			return
		}

		if (verbose) {
			console.log(`🔗 连接 SSH 服务器: ${serverHost}`)
		}

		try {
			const sshConfig = {
				host: serverHost,
				username: 'root',
				...(sshPrivateKey ? { privateKey: sshPrivateKey } : { privateKeyPath }),
			}

			await this.ssh.connect(sshConfig)

			this.isConnected = true

			if (verbose) {
				console.log('✅ SSH 连接成功')
			}
		} catch (error) {
			this.isConnected = false
			throw new Error(`SSH 连接失败: ${error}`)
		}
	}

	async disconnect() {
		if (!this.isConnected) return

		// NOTE: "await" 对此表达式的类型没有影响。ts(80007)
		//  查阅文档是支持的
		await this.ssh.dispose()
		this.isConnected = false

		if (verbose) {
			console.log('🔄 SSH 连接已关闭')
		}
	}

	async execCommand(command: string, noLog = false) {
		if (!this.isConnected) {
			throw new Error('SSH 未连接，请先调用 connect()')
		}

		if (verbose && !noLog) {
			console.log(`🔧 执行命令: ${command}`)
		}

		try {
			const result = await this.ssh.execCommand(command)

			if (verbose && !noLog) {
				if (result.stdout) {
					console.log(`📤 输出: ${result.stdout}`)
				}

				// NOTE: 不太明白，为什么执行 docker compose down 错误信息居然是打印到stderr
				if (result.stderr) {
					console.log(`⚠️ 错误: ${result.stderr}`)
				}
			}

			// NOTE: 一般远程命令执行错误了，也不会catch，而是通过code区分
			if (result.code !== 0) {
				throw new Error(`退出码 ${result.code}`)
			}

			return result.stdout
		} catch (error) {
			if (verbose) {
				console.error(`❌ 命令执行失败: ${error}`)
			}
			throw error
		}
	}

	async putFile(localPath: string, remotePath: string): Promise<void> {
		if (!this.isConnected) {
			throw new Error('SSH 未连接，请先调用 connect()')
		}

		if (verbose) {
			console.log(`📤 上传文件: ${localPath} -> ${remotePath}`)
		}

		try {
			await this.ssh.putFile(localPath, remotePath)

			if (verbose) {
				console.log('✅ 文件上传成功')
			}
		} catch (error) {
			if (verbose) {
				console.error(`❌ 文件上传失败: ${error}`)
			}
			throw error
		}
	}

	async getFile(remotePath: string, localPath: string): Promise<void> {
		if (!this.isConnected) {
			throw new Error('SSH 未连接，请先调用 connect()')
		}

		if (verbose) {
			console.log(`📥 下载文件: ${remotePath} -> ${localPath}`)
		}

		try {
			await this.ssh.getFile(localPath, remotePath)

			if (verbose) {
				console.log('✅ 文件下载成功')
			}
		} catch (error) {
			if (verbose) {
				console.error(`❌ 文件下载失败: ${error}`)
			}
			throw error
		}
	}
}

export const sshClient = new SSHClient()
