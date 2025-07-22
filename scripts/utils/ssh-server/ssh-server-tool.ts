import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import fse from 'fs-extra'
import inquirer from 'inquirer'
import dayjs from 'dayjs'
import { verbose, serverHost } from '../env'
import { sshClient } from '../ssh-client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SSH_PRIV_KEY = 'SSH_PRIVATE_KEY'
const SSH_KNOWN_HOSTS = 'SSH_KNOWN_HOSTS'
const privateKeysDir = path.join(__dirname, 'private-keys')

/**
 * SSH 服务器密钥管理工具
 * 支持生成密钥对、上传公钥到服务器等功能
 */
class SSHServerTool {
	private readonly needComments = true

	/* 生成 SSH 密钥对 */
	async generateKeyPair(opts: SSHServerToolOpt = {}) {
		const { comment, upload = false, syncGit = false, dryRun = false } = opts
		await fse.ensureDir(privateKeysDir)

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

		// 生成时间戳文件名
		const timestamp = dayjs().format('YYYY-MM-DDTHH-mm-ss')
		const keyName = `key-${timestamp}`
		const privKeyPath = path.join(privateKeysDir, keyName)
		const pubKeyPath = `${privKeyPath}.pub`

		if (verbose) {
			console.log(`🔑 生成 SSH 密钥对: ${keyName}`)
			if (currComment) console.log(`📝 备注: ${currComment}`)
		}

		try {
			// 生成密钥对
			const cmd = `ssh-keygen -t rsa -b 4096 -C "${currComment}" -f "${privKeyPath}" -N ""`
			execSync(cmd, { stdio: verbose ? 'inherit' : 'pipe' })

			await fse.chmod(privKeyPath, 0o600)
			await fse.chmod(pubKeyPath, 0o644)

			if (verbose) {
				console.log('✅ 密钥对生成成功')
				console.log(`私钥: ${privKeyPath}`)
				console.log(`公钥: ${pubKeyPath}`)
			}

			await sshClient.connect()
			if (upload) await this.uploadPubKey({ pubKeyPath, comment: currComment, dryRun })
			if (syncGit) await this.syncGitSecrets(privKeyPath)
		} catch (error) {
			console.error(`❌ 密钥生成失败: ${error}`)
			throw error
		} finally {
			await sshClient.disconnect()
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

	async syncGitSecrets(privKeyPath: string) {
		// NOTE：防止意外上传，仅打印控制台，需要手动上传
		//  gh 和调用的当前工作区有关，所以默认是上传到当前的仓库的

		try {
			const knownHosts = await this.getServerHostKey()

			console.log('\n🔐 GitHub Secrets 设置命令:')
			console.log('请手动执行以下命令来设置 GitHub Secrets:')
			console.log('')

			console.log('# 设置私钥')
			console.log(`gh secret set ${SSH_PRIV_KEY} --body "@${privKeyPath}"`)
			console.log('')

			console.log('# 设置 SSH Known Hosts')
			const knownHostsEscaped = knownHosts.replace(/'/g, "\\'")
			console.log(`gh secret set ${SSH_KNOWN_HOSTS} --body '${knownHostsEscaped}'`)
			console.log('')
		} catch (error) {
			console.error(`❌ 读取密钥文件失败: ${error}`)
		}
	}

	async getServerHostKey() {
		try {
			const cmd = `ssh-keyscan -H ${serverHost}`
			const serverKey = execSync(cmd, { encoding: 'utf8' }).trim()
			if (verbose) {
				console.log(`🔍 获取服务器公钥: ${serverHost}`)
				console.log(serverKey)
				console.log('')
			}
			return serverKey
		} catch (error) {
			throw new Error(`获取服务器公钥失败: ${error}`)
		}
	}
}

export interface SSHServerToolOpt {
	comment?: string
	upload?: boolean
	syncGit?: boolean
	dryRun?: boolean
}

export const sshServerTool = new SSHServerTool()
