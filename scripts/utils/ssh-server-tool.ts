import { execSync } from 'child_process'
import fse from 'fs-extra'
import inquirer from 'inquirer'
import path from 'path'
import { verbose } from './env'
import { secretsConfig } from './secrets/secrets-config'
import { sshClient } from './ssh-client'
import { serverHost } from './env'

const targetFolder = secretsConfig.secretSourceDir

/**
 * SSH 服务器密钥管理工具
 */
class SSHServerTool {
	private readonly needComments = true

	/* 生成 SSH 密钥对 */
	async genKeyPair(opts: SSHServerToolOpt = {}) {
		const { comment, upload = false, dryRun = false } = opts
		await fse.ensureDir(targetFolder)

		// 获取备注信息
		let currComment = comment || ''
		if (this.needComments && !currComment) {
			const answers = await inquirer.prompt([
				{
					type: 'input',
					name: 'comment',
					message: '请输入密钥备注信息（用于标识用途）:',
					validate: (input: string) => (input.trim() ? true : '备注信息不能为空'),
				},
			])
			currComment = answers.comment
		}

		// 生成文件名
		const keyName = 'id_rsa'
		const privKeyPath = path.join(targetFolder, keyName)
		const pubKeyPath = `${privKeyPath}.pub`

		console.log(`🔑 生成 SSH 密钥对: ${keyName}, comment: ${currComment}`)
		console.log(`📁 目标目录: ${targetFolder}`)

		try {
			// NOTE: github ci 遇到过，貌似不支持 OPENSSH 格式，或者 node-ssh 不知道有什么兼容问题，改了就没问题了（自己电脑测试又没问题）
			// 生成密钥对，使用 -m PEM 格式确保兼容性
			const cmd = `ssh-keygen -t rsa -b 4096 -m PEM -C "${currComment}" -f "${privKeyPath}" -N ""`
			execSync(cmd, { stdio: verbose ? 'inherit' : 'pipe' })

			await fse.chmod(privKeyPath, 0o600)
			await fse.chmod(pubKeyPath, 0o644)

			console.log('✅ 密钥对生成成功')
			console.log(`📄 私钥文件: ${privKeyPath}`)
			console.log(`📄 公钥文件: ${pubKeyPath}`)

			await sshClient.connect()
			if (upload) await this.uploadPubKey({ pubKeyPath, comment: currComment, dryRun })
		} catch (error) {
			console.error(`❌ 密钥生成失败: ${error}`)
			throw error
		} finally {
			await sshClient.disconnect()
		}
	}

	async genKnownHosts() {
		const result = await this.getServerHostKeys()
		const knownHostsFile = path.join(targetFolder, 'known_hosts')
		await fse.writeFile(knownHostsFile, result)
		console.log(`📄 已保存到: ${knownHostsFile}`)
	}

	/* 获取服务器公钥信息 */
	async getServerHostKeys() {
		try {
			console.log(`🔍 获取服务器 ${serverHost} 的公钥信息...`)
			const cmd = `ssh-keyscan -H ${serverHost}`
			const result = execSync(cmd, { encoding: 'utf8' }).trim()
			if (!result) {
				throw new Error(`无法获取服务器 ${serverHost} 的公钥信息`)
			}
			console.log('✅ 服务器公钥信息获取成功:')
			console.log(result)
			return result
		} catch (error) {
			console.error(`❌ 获取服务器公钥失败: ${error}`)
			throw error
		}
	}

	/* 上传公钥到服务器 */
	async uploadPubKey(opts: { pubKeyPath: string; comment?: string; dryRun?: boolean }) {
		const { pubKeyPath, comment, dryRun = false } = opts
		if (!(await fse.pathExists(pubKeyPath))) throw new Error(`公钥文件不存在: ${pubKeyPath}`)

		const pubKeyContent = (await fse.readFile(pubKeyPath, 'utf8')).trim()

		if (verbose) {
			console.log(`📤 上传公钥到服务器: ${pubKeyPath}`)
			if (comment) console.log(`📝 备注: ${comment}`)
		}

		try {
			// NOTE：虽然不是很严谨，不过暂时就用 comment 吧
			if (comment) {
				const checkCmd = `cat ~/.ssh/authorized_keys 2>/dev/null || echo ""`
				const existingKeys = await sshClient.execCommand(checkCmd, true)

				if (dryRun) {
					console.log('🔍 当前authorized_keys')
					console.log(existingKeys.split('\n').join('\n\n'))
					console.log('🔍 当前公钥')
					console.log(pubKeyContent)
					return
				}

				if (existingKeys && existingKeys.includes(comment)) {
					throw new Error(`密钥已存在，comment: ${comment}`)
				}
			}

			if (dryRun) {
				if (verbose) console.log('🔍 DRY RUN - 跳过写入 authorized_keys')
			} else {
				const addKeyCmd = `
					mkdir -p ~/.ssh
					chmod 700 ~/.ssh
					echo "${pubKeyContent}" >> ~/.ssh/authorized_keys
					chmod 600 ~/.ssh/authorized_keys
				`
				await sshClient.execCommand(addKeyCmd)
			}
			if (verbose) console.log('✅ 公钥上传成功')
		} catch (error) {
			console.error(`❌ 公钥上传失败: ${error}`)
			throw error
		}
	}
}

export interface SSHServerToolOpt {
	comment?: string
	upload?: boolean
	dryRun?: boolean
}

export const sshServerTool = new SSHServerTool()
