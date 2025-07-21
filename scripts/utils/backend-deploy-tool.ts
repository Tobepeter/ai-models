import { execSync } from 'child_process'
import fs from 'fs'
import { NodeSSH } from 'node-ssh'
import { homedir } from 'os'
import path from 'path'
import { dockerImageName, dockerNamespace, dockerPassword, dockerRegistry, dockerRegistryVpc, dockerUsername, projectRoot, serverHost } from './env'

const backendRoot = path.join(projectRoot, 'backend')

/**
 * 后端部署工具
 */
class BackendDeployTool {
	ssh = new NodeSSH()
	config = {
		host: serverHost,
		username: 'root',
		privateKeyPath: path.join(homedir(), '.ssh', 'id_rsa'),
		verbose: false,
		dockerImageName,
		dockerRegistry,
		dockerRegistryVpc,
		dockerNamespace,
		dockerUsername,
		dockerPassword,
	}

	// 部署路径配置
	deployPaths = {
		baseDir: '/srv/ai-models-backend',
		localComposeFile: 'docker-compose.prod.yml',
		localEnv: '.env',
	}

	/** 构建并推送Docker镜像 */
	async deployDocker() {
		this.validateDockerConfig()

		const imageTag = this.getImageName()
		const backendPath = path.join(projectRoot, 'backend')

		try {
			await this.dockerLogin()

			const buildCmd = `docker buildx build --platform=linux/amd64 --push -t ${imageTag} .`

			execSync(buildCmd, {
				cwd: backendPath,
				encoding: 'utf8',
				stdio: 'inherit',
			})

			console.log('✅ Docker镜像构建并推送完成')
		} catch (error: any) {
			console.error('❌ Docker镜像构建推送失败:', error.message)
			throw error
		}
	}

	/** 设置配置 */
	setConfig(options: Partial<typeof this.config>) {
		this.config = { ...this.config, ...options }
	}

	/** 获取完整镜像名 */
	getImageName() {
		const { dockerRegistry, dockerNamespace, dockerImageName } = this.config
		return `${dockerRegistry}/${dockerNamespace}/${dockerImageName}:latest`
	}

	/** Docker登录 */
	async dockerLogin() {
		const { dockerRegistry, dockerUsername, dockerPassword } = this.config

		try {
			const loginCmd = `echo "${dockerPassword}" | docker login --username ${dockerUsername} --password-stdin ${dockerRegistry}`
			execSync(loginCmd, { encoding: 'utf8', stdio: 'pipe' })
		} catch (error: any) {
			console.error('❌ Docker登录失败:', error.message)
			throw error
		}
	}

	/** 远程服务器Docker登录 */
	async remoteDockerLogin() {
		// NOTE: 先预留，远程已经登录好了
		const { dockerRegistry, dockerUsername, dockerPassword } = this.config

		console.log('🔐 远程服务器登录Docker Registry...')

		try {
			// 使用 echo 管道密码到 docker login，避免在命令行中暴露密码
			const loginCmd = `echo "${dockerPassword}" | docker login --username ${dockerUsername} --password-stdin ${dockerRegistry}`

			// 注意：不要在verbose模式下显示包含密码的命令
			if (this.config.verbose) {
				console.log(`远程执行登录命令: docker login --username ${dockerUsername} --password-stdin ${dockerRegistry}`)
			} else {
				console.log('远程执行Docker登录...')
			}

			const result = await this.ssh.execCommand(loginCmd)

			if (result.code !== 0) {
				throw new Error(`登录失败: ${result.stderr}`)
			}

			console.log('✅ 远程服务器Docker登录成功')
		} catch (error: any) {
			console.error('❌ 远程服务器Docker登录失败:', error.message)
			console.error('💡 请检查用户名和密码是否正确')
			throw error
		}
	}

	/** 验证Docker配置 */
	validateDockerConfig() {
		const { dockerImageName: imageName, dockerRegistry, dockerNamespace } = this.config
		const missingConfigs: string[] = []

		if (!dockerRegistry) {
			missingConfigs.push('dockerRegistry')
		}

		if (!dockerNamespace) {
			missingConfigs.push('dockerNamespace')
		}

		if (!imageName) {
			missingConfigs.push('dockerImageName')
		}

		if (missingConfigs.length > 0) {
			console.error('❌ Docker 配置缺失，请设置以下环境变量:')
			missingConfigs.forEach((config) => {
				console.error(`   - ${config}`)
			})
			console.error('')
			console.error('💡 参考配置示例: .env.example')
			console.error('💡 或创建 .env 文件并设置相应的环境变量')
			throw new Error(`Docker 配置缺失: ${missingConfigs.join(', ')}`)
		}

		console.log('✅ Docker 配置验证通过')
	}

	/** 部署到服务器 */
	async deployToServer() {
		console.log('🚀 开始部署到服务器...')

		try {
			await this.connect()
			await this.setupDirs()
			await this.uploadDeployFiles()
			await this.startServices()
			console.log('✅ 服务器部署完成')
		} finally {
			await this.disconnect()
		}
	}

	/** 连接SSH */
	async connect() {
		const { host, username, privateKeyPath } = this.config
		console.log(`🔗 连接服务器 ${host}...`)

		await this.ssh.connect({ host, username, privateKeyPath })
		console.log('✅ SSH连接成功')
	}

	/** 断开SSH连接 */
	async disconnect() {
		if (this.ssh.isConnected()) {
			this.ssh.dispose()
			console.log('🔄 SSH连接已关闭')
		}
	}

	/** 设置服务器目录 */
	async setupDirs() {
		console.log('📁 设置服务器目录...')
		const { baseDir } = this.deployPaths

		await this.ssh.execCommand(`mkdir -p ${baseDir}`)
		this.logCommand(`创建目录`, baseDir)
		console.log('✅ 目录设置完成')
	}

	/** 上传部署文件 */
	async uploadDeployFiles() {
		console.log('📤 上传部署文件...')
		const { baseDir, localComposeFile, localEnv } = this.deployPaths

		const localEnvPath = path.join(backendRoot, localEnv)
		if (!fs.existsSync(localEnvPath)) {
			throw new Error('.env 文件不存在，请先创建')
		}

		// 上传 docker-compose.yml
		console.log('📄 上传 docker-compose...')
		const localComposePath = path.join(backendRoot, localComposeFile)
		const remoteComposePath = path.join(baseDir, 'docker-compose.yml')
		await this.ssh.putFile(localComposePath, remoteComposePath)
		this.logCommand('上传 docker-compose', `${localComposePath} -> ${remoteComposePath}`)

		// 上传并修改 .env 文件
		console.log('📄 上传并修改 .env...')
		await this.uploadModifiedEnv(localEnvPath, path.join(baseDir, '.env'))

		console.log('✅ 部署文件上传完成')
	}

	/** 上传并修改 .env 文件 */
	async uploadModifiedEnv(localPath: string, remotePath: string) {
		// 读取本地 .env 文件
		const envContent = fs.readFileSync(localPath, 'utf-8')

		// 添加 IMAGE_NAME 配置
		const imageName = this.getImageName()
		const modifiedContent = `${envContent}\n# 部署时自动添加\nIMAGE_NAME=${imageName}\n`

		// 写入远程文件
		await this.ssh.execCommand(`cat > ${remotePath} << 'EOF'\n${modifiedContent}EOF`)
		this.logCommand('修改 .env', `添加 IMAGE_NAME=${imageName}`)
	}

	/** 启动服务 */
	async startServices() {
		console.log('🐳 拉取镜像并启动服务...')
		const { baseDir } = this.deployPaths

		const image = this.getImageName()
		const cd = `cd ${baseDir}`

		// 停止现有服务
		await this.ssh.execCommand(`${cd} && docker compose down`)
		this.logCommand('停止现有服务', 'docker compose down')

		// 拉取最新镜像
		await this.ssh.execCommand(`docker pull ${image}`)
		this.logCommand('拉取最新镜像', image)

		// 启动服务
		await this.ssh.execCommand(`${cd} && docker compose up -d`)
		this.logCommand('启动服务', 'docker compose up -d')

		// 检查服务状态
		const result = await this.ssh.execCommand(`${cd} && docker compose ps`)
		console.log('📊 服务状态:')
		console.log(result.stdout)

		console.log('✅ 服务启动完成')
	}

	/** 查看服务日志 */
	async viewLogs(lines: number = 50) {
		console.log(`📋 查看服务日志 (最近 ${lines} 行)...`)

		try {
			await this.connect()

			const { baseDir } = this.deployPaths
			const cmd = `cd ${baseDir} && docker compose logs --tail=${lines}`

			const result = await this.ssh.execCommand(cmd)
			console.log('📋 服务日志:')
			console.log(result.stdout)

			if (result.stderr) {
				console.error('❌ 错误日志:')
				console.error(result.stderr)
			}
		} finally {
			await this.disconnect()
		}
	}

	/** 重启服务 */
	async restartServices() {
		console.log('🔄 重启服务...')

		try {
			await this.connect()

			const { baseDir } = this.deployPaths
			const cmd = `cd ${baseDir} && docker compose restart`

			await this.ssh.execCommand(cmd)
			this.logCommand('重启服务', cmd)

			console.log('✅ 服务重启完成')
		} finally {
			await this.disconnect()
		}
	}

	/** 日志输出 */
	logCommand(msg: string, detail?: string) {
		const output = this.config.verbose && detail ? `${msg}: ${detail}` : msg
		console.log(`✅ ${output}`)
	}
}

export const backendDeployTool = new BackendDeployTool()
