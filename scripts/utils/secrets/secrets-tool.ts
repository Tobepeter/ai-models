import { appendFileSync, copyFileSync, existsSync, readdirSync, readFileSync, unlinkSync } from 'fs'
import fse from 'fs-extra'
import { join } from 'path'
import { cryptoUtil } from '../crypto-util'
import { projectRoot } from '../env'
import { fsUtil } from '../fs-util'
import { secretsConfig } from './secrets-config'

const { secretsDir, secretSourceDir, secretDecDir, encryptedFile, secretKey, sshDir } = secretsConfig

/**
 * 密钥管理工具
 * 用于加密解密敏感文件，支持CI/CD环境
 *
 * CICD 只需要配置一个 SECRETS_KEY 即可，环境变量信息可以解密出来
 *
 * 背景
 * - github 的 secrets 配置起来相当麻烦，而且换一个平台又要来一遍
 * - 方便本地管理，一体化
 * - gihhub 我试过用 ssh privKey，但是居然是截断的，排查很久无法解决
 */
class SecretsTool {
	/** 加密文件夹 */
	async encrypt() {
		console.log('🔐 正在加密文件...')

		if (!existsSync(secretSourceDir)) {
			throw new Error(`文件目录不存在: ${secretSourceDir}`)
		}

		const files = readdirSync(secretSourceDir)
		if (files.length === 0) {
			throw new Error(`目录中没有文件: ${secretSourceDir}`)
		}

		console.log(`📦 找到 ${files.length} 个文件:`, files)

		const tempZipFile = join(secretsDir, 'temp.zip')
		await fsUtil.createZip(secretSourceDir, tempZipFile)
		await cryptoUtil.encryptFile(tempZipFile, encryptedFile, secretKey)
		unlinkSync(tempZipFile)

		console.log(`✅ 文件已加密到: ${encryptedFile}`)
	}

	/** 解压加密文件夹 */
	async decrypt() {
		console.log('🔓 正在解密文件...')

		if (!existsSync(encryptedFile)) {
			throw new Error(`加密文件不存在: ${encryptedFile}`)
		}

		fse.emptyDirSync(secretDecDir)

		// 解压文件到目标位置
		const tempZipFile = join(secretsDir, 'temp.zip')
		await cryptoUtil.decryptFile(encryptedFile, tempZipFile, secretKey)
		await fsUtil.extractZip(tempZipFile, secretDecDir)

		// 删除临时zip文件
		unlinkSync(tempZipFile)

		// 打印解密后的文件
		const files = readdirSync(secretDecDir)
		console.log(`✅ 已解密 ${files.length} 个文件到 ${secretDecDir}:`, files)
	}

	/** 配置cicd环境 */
	async prepareInCICD() {
		const envFile = join(secretDecDir, '.env')
		const idRsaFile = join(secretDecDir, 'id_rsa')
		const idRsaPubFile = join(secretDecDir, 'id_rsa.pub')
		const knownHostsFile = join(secretDecDir, 'known_hosts')
		const targetKnownHostsFile = join(sshDir, 'known_hosts')

		// 必须存在
		const allFiles = [envFile, idRsaFile, idRsaPubFile, knownHostsFile]
		for (const file of allFiles) {
			if (!existsSync(file)) {
				throw new Error(`文件不存在: ${file}`)
			}
		}

		copyFileSync(envFile, join(projectRoot, '.env'))
		copyFileSync(idRsaFile, join(sshDir, 'id_rsa'))

		// NOTE: 其实公钥是无所谓的
		copyFileSync(idRsaPubFile, join(sshDir, 'id_rsa.pub'))

		// 记录known_hosts 追加写入
		appendFileSync(targetKnownHostsFile, '\n') // 防止和前面的信息尾部拼接起来了
		appendFileSync(targetKnownHostsFile, readFileSync(knownHostsFile))
	}

	/** 生成加密密钥 */
	async generateKey() {
		const key = await cryptoUtil.genSecretKey()
		console.log(`🔑 生成密钥: ${key}`)
		console.log('请手动执行以下命令来设置 GitHub Secrets:')

		console.log(`gh secret set SECRETS_KEY --body "${key}"`)
		console.log('')
	}
}

export const secretsTool = new SecretsTool()
