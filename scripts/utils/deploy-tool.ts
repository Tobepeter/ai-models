import archiver from 'archiver'
import { execSync } from 'child_process'
import fs from 'fs'
import fse from 'fs-extra'
import { NodeSSH } from 'node-ssh'
import { homedir } from 'os'
import path, { dirname } from 'path'
import prettyBytes from 'pretty-bytes'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '../..')

interface DeployConfig {
	host: string
	username: string
	privateKeyPath: string
	verbose: boolean
}

/**
 * 前端项目部署
 */
class DeployTool {
	// NOTE: 不使用密码，仅使用密钥对验证
	ssh = new NodeSSH()
	config: DeployConfig = {
		host: '',
		username: 'root',
		privateKeyPath: path.join(homedir(), '.ssh', 'id_rsa'),
		verbose: false,
	}

	sourceFolder = path.join(projectRoot, 'dist')
	sourceFile = path.join(projectRoot, 'temp', 'dist.zip')
	targetZipFolder = '/temp'
	targetDeployFolder = '/var/www/chat'

	init(config: Partial<DeployConfig>) {
		this.config = { ...this.config, ...config }
		this.checkValid()
	}

	checkValid() {
		const { host, username, privateKeyPath } = this.config
		if (!host || !username || !privateKeyPath) {
			throw new Error('服务器配置不完整')
		}
	}

	/** 执行构建 */
	build() {
		console.log('🏗️  开始构建项目...')
		try {
			const result = execSync('npm run build', {
				cwd: projectRoot,
				encoding: 'utf8',
			})
			console.log('✅ 构建完成')
			return result
		} catch (error) {
			console.error('构建失败:', error)
			throw error
		}
	}

	/** 打包 dist 文件夹 */
	async zipDist() {
		const { sourceFile, config } = this
		const { verbose } = config
		await fse.ensureDir(dirname(sourceFile))

		console.log('📦 打包 dist 文件夹...')
		return new Promise<void>((resolve, reject) => {
			const zipPath = sourceFile
			const output = fs.createWriteStream(zipPath)
			const archive = archiver('zip', { zlib: { level: 9 } })

			output.on('close', () => {
				console.log('✅ 打包完成，大小:', prettyBytes(archive.pointer()))
				resolve()
			})

			archive.on('error', reject)
			archive.pipe(output)
			const destpath = 'dist' // 默认嵌套，和 shell zip 命令保持一致

			archive.directory(this.sourceFolder, destpath)
			archive.finalize()

			if (verbose) {
				console.log(`打包从 ${this.sourceFolder} 到 ${sourceFile}`)
			}
		})
	}

	clearZipFile() {
		fse.removeSync(this.sourceFile)
		this.logCommand('🗑️ 清理临时文件', this.sourceFile)
	}

	/** 上传到服务器 */
	async uploadToServer() {
		console.log('🚀 上传文件到服务器...')
		const { config, sourceFile, targetZipFolder, targetDeployFolder } = this
		const { host, username, privateKeyPath, verbose } = config
		const targetZipFile = path.join(targetZipFolder, 'dist.zip')
		await this.ssh.connect({
			host,
			username,
			privateKeyPath,
		})

		if (verbose) {
			console.log(`上传文件 ${sourceFile} 到 ${targetZipFile}`)
		}

		await this.ssh.putFile(sourceFile, targetZipFile)
		console.log('✅ 文件上传完成')

		console.log('🔄 执行服务器端部署...')

		let cmd = ''

		// 解压文件
		cmd = `cd ${targetZipFolder} && unzip -o dist.zip`
		await this.ssh.execCommand(cmd)
		this.logCommand('✅ 解压完成', cmd)

		// 解压后删除 zip 文件
		cmd = `rm -f ${targetZipFile}`
		await this.ssh.execCommand(cmd)
		this.logCommand('✅ 清理 zip 文件', cmd)

		// 清空目标目录
		cmd = `rm -rf ${targetDeployFolder}/*`
		await this.ssh.execCommand(cmd)
		this.logCommand('✅ 清空目标目录', cmd)

		// TODO: 理论上备份一下

		// 复制文件 (解压后是 /temp/dist/xxx，复制 /temp/dist/* 到目标目录)
		cmd = `cp -r ${targetZipFolder}/dist/* ${targetDeployFolder}/`
		await this.ssh.execCommand(cmd)
		this.logCommand('✅ 文件复制完成', cmd)

		// 清理解压的临时文件
		cmd = `rm -rf ${targetZipFolder}/*`
		await this.ssh.execCommand(cmd)
		this.logCommand('✅ 清理临时文件', cmd)

		console.log('🔄 关闭连接...')

		// NOTE: "await" 对此表达式的类型没有影响。ts(80007)
		//  查阅文档是支持的
		await this.ssh.dispose()
		console.log('✅ 连接已关闭')
	}

	logCommand(msg: string, cmd: string) {
		if (this.config.verbose) {
			console.log(`${msg}, cmd: ${cmd}`)
		} else {
			console.log(`${msg}`)
		}
	}
}

export const deployTool = new DeployTool()
