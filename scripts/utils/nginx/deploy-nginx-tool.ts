import fs from 'fs-extra'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { verbose } from '../env'
import { sshClient } from '../ssh-client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const souceConf = path.join(__dirname, 'default.conf')

/**
 * 部署nginx工具
 * 
 * NOTE：其实一般不需要经常调用，只是需要时候改一下就行了
 * nginx conf 不是标准的json 文件，就不做动态注入了
 * 需要时候
 */
class DeployNginxTool {
	nginxDir = __dirname
	remoteConfigDir = '/etc/nginx/conf.d'

	async deployFile(target: string) {
		const remotePath = path.join(this.remoteConfigDir, `${target}`)

		if (!fs.existsSync(souceConf)) {
			throw new Error(`配置文件不存在: ${souceConf}`)
		}

		console.log(`🚀 部署 ${target}.conf...`)
		await sshClient.connect()
		try {
			if (verbose) console.log(`📤 上传: ${souceConf} -> ${remotePath}`)
			await sshClient.putFile(souceConf, remotePath)

			if (verbose) console.log('🔍 测试配置...')
			await sshClient.execCommand('nginx -t')

			if (verbose) console.log('🔄 重载服务...')
			await sshClient.execCommand('systemctl reload nginx')

			console.log(`✅ ${target}.conf 部署成功`)
		} catch (error) {
			console.error(`❌ 部署失败: ${error}`)
			throw error
		} finally {
			await sshClient.disconnect()
		}
	}

	async removeFile(target: string) {
		const remotePath = path.join(this.remoteConfigDir, `${target}.conf`)

		console.log(`🗑️ 删除 ${target}.conf...`)
		await sshClient.connect()

		try {
			if (verbose) console.log(`🗑️ 删除: ${remotePath}`)
			await sshClient.execCommand(`rm -f ${remotePath}`)

			if (verbose) console.log('🔍 测试配置...')
			await sshClient.execCommand('nginx -t')

			if (verbose) console.log('🔄 重载服务...')
			await sshClient.execCommand('systemctl reload nginx')

			console.log(`✅ ${target}.conf 删除成功`)
		} catch (error) {
			console.error(`❌ 删除失败: ${error}`)
			throw error
		} finally {
			await sshClient.disconnect()
		}
	}
}

export const deployNginxTool = new DeployNginxTool()