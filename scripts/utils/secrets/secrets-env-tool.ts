import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs'
import inquirer from 'inquirer'
import { join } from 'path'
import { projectRoot } from '../env'
import { secretsConfig } from './secrets-config'

const { secretSourceDir } = secretsConfig

/**
 * 环境文件管理工具
 * 处理 .env 文件的生成、同步和过滤
 */
class SecretsEnvTool {
	/** 同步环境配置 */
	async syncSecrets(yes: boolean) {
		const envLocal = join(projectRoot, '.env.local')
		const envExample = join(projectRoot, '.env.example')
		const envBe = join(projectRoot, 'backend/.env')
		const envBeExample = join(projectRoot, 'backend/.env.example')
		const secEnv = join(secretSourceDir, '.env')
		const secEnvBe = join(secretSourceDir, '.env.be')

		let override = false

		if (existsSync(envLocal)) {
			// 1. .env.local -> .env.example
			await this.genEnvExample(envLocal, envExample)

			// 2. .env.local -> secrets/.env
			override = yes || (await this.confirmOverwrite(secEnv))
			if (override) {
				// vite前缀trim掉
				const filtered = this.genEnvCfg(envLocal, 'VITE_')
				writeFileSync(secEnv, filtered)
				console.log('🔄 已同步 secrets/.env 🚀')
			}
		} else {
			console.log('⏭️ 跳过：.env.local 不存在')
		}

		if (existsSync(envBe)) {
			// 3. backend/.env -> backend/.env.example
			await this.genEnvExample(envBe, envBeExample)

			// 4. backend/.env -> secrets/.env.be
			override = yes || (await this.confirmOverwrite(secEnvBe))
			if (override) {
				copyFileSync(envBe, secEnvBe)
				console.log('🔄 已同步 secrets/.env.be 🗝️')
			}
		} else {
			console.log('⏭️ 跳过：backend/.env 不存在')
		}
	}

	/** 生成 .env.example 模板文件 */
	async genEnvExample(src: string, dst: string) {
		if (!existsSync(src)) {
			console.log(`❌ 源文件不存在: ${src}`)
			return
		}
		const txt = readFileSync(src, 'utf8')
		const lines = txt.split('\n')
		const exLines = lines.map((l) => {
			const t = l.trim()
			if (t.startsWith('#') || t === '' || !l.includes('=')) return l
			const idx = l.indexOf('=')
			if (idx > 0) return l.substring(0, idx + 1)
			return l
		})
		writeFileSync(dst, exLines.join('\n'))
		console.log(`✅ 已生成 ${dst} 🎉`)
	}

	/** 从环境文件生成配置 */
	private genEnvCfg(src: string, prefix?: string) {
		const txt = readFileSync(src, 'utf8')
		const lines = txt.split('\n')

		// prefix会删掉，但是尾部保留
		const extraLines: string[] = []

		const result = lines.map((l) => {
			const t = l.trim()
			if (t.startsWith('#') || t === '' || !l.includes('=')) return l
			if (prefix && t.startsWith(prefix)) {
				extraLines.push(l)
				return l.slice(prefix.length)
			}
			return l
		})

		if (extraLines.length > 0) {
			result.push('')
			result.push(`# prefix: ${prefix}`)
			result.push(...extraLines)
		}

		return result.join('\n')
	}

	/** 确认覆盖文件 */
	private async confirmOverwrite(fp: string) {
		if (!existsSync(fp)) return true
		const { overwrite } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'overwrite',
				message: `⚠️ 覆盖 ${fp}?`,
			},
		])
		return overwrite
	}
}

export const secretsEnvTool = new SecretsEnvTool()
