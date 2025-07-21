import archiver from 'archiver'
import { execSync } from 'child_process'
import fs from 'fs'
import fse from 'fs-extra'
import path, { dirname } from 'path'
import prettyBytes from 'pretty-bytes'
import { ossEnable, ossPrefix, projectRoot } from './env'
import { fsUtil } from './fs-util'
import { ossAPI } from './oss-api'
import { pathUtil } from './path-util'
import { sshClient } from './ssh-client'

/**
 * 前端项目部署
 */
class DeployTool {
	sourceFolder = path.join(projectRoot, 'dist')
	sourceFile = path.join(projectRoot, 'temp', 'dist.zip')
	targetZipFolder = '/temp'
	targetDeployFolder = '/var/www/chat'

	config = {
		dryRun: false,
	}

	async upload() {
		if (ossEnable) {
			await this.ossValidateHtml()
			await this.uploadHtmlToServer()
			await this.uploadToOss()
		} else {
			await this.uploadToServer()
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
		const { sourceFile } = this
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

			console.log(`打包从 ${this.sourceFolder} 到 ${sourceFile}`)
		})
	}

	clearZipFile() {
		fse.removeSync(this.sourceFile)
		console.log('🗑️ 清理临时文件', this.sourceFile)
	}

	/** OSS 上传方法 */
	async uploadToOss() {
		// 获取 OSS 上传基础路径
		const ossBase = pathUtil.getOssBasePrefix()
		console.log(`OSS 上传基础路径: ${ossBase}`)
		await this.clearOssFolder()
		await this.uploadDistToOss()
		console.log('✅ OSS 上传完成')
	}

	/** 清理 OSS 目标文件夹 */
	async clearOssFolder() {
		console.log('🗑️ 清理 OSS 目标目录...')
		try {
			// TODO: 支持循环清理模式，比如最大尝试n次
			// TODO：可以支持版本号方式，或者如果担心容量过大，可以用轮换版本控制
			const maxKeys = 1000 // 最多1000个文件
			const result = await ossAPI.getFileList(ossPrefix, maxKeys)
			if (result.files && result.files.length > 0 && !this.config.dryRun) {
				for (const file of result.files) {
					await ossAPI.deleteFile(file.objectKey)
				}
				console.log(`✅ 清理了 ${result.files.length} 个文件`)
			} else {
				console.log('✅ 目标目录已为空')
			}
		} catch (error: any) {
			console.warn('⚠️ 清理 OSS 目录时出现警告:', error.message)
		}
	}

	/** 上传 dist 文件夹到 OSS */
	async uploadDistToOss() {
		console.log('📤 上传静态资源到 OSS...')

		// const exclude = ['index.html']
		const exclude = [] // 可以上传html，当做备份也行
		const allFiles = fsUtil.getAllFiles(this.sourceFolder, { exclude }) // 递归获取所有文件

		console.log(`📁 找到 ${allFiles.length} 个静态资源文件需要上传到 OSS`)

		for (const relPath of allFiles) {
			const posixPath = fsUtil.posixPath(relPath) // 确保使用正斜杠
			const objectKey = path.join(ossPrefix, posixPath)
			const absolutePath = path.join(this.sourceFolder, posixPath)
			try {
				const fileBuffer = fs.readFileSync(absolutePath)
				const contentType = fsUtil.getContentType(absolutePath)
				if (!this.config.dryRun) {
					await ossAPI.uploadFile(fileBuffer, objectKey, contentType)
				}
				console.log(`✅ 上传到 OSS: ${objectKey}`)
			} catch (error: any) {
				console.error(`❌ OSS 上传失败 ${objectKey}:`, error.message)
				throw error
			}
		}

		console.log(`✅ oss文件全部成功上传`)
	}

	/** 验证html是否合法配置 */
	async ossValidateHtml() {
		const content = fs.readFileSync(path.join(this.sourceFolder, 'index.html'), 'utf-8')
		if (!content.includes(pathUtil.getOssBasePrefix())) {
			throw new Error('html内容没有关联到oss地址，是否忘了执行build命令🤔？')
		}
	}

	/** 上传到服务器 */
	async uploadToServer() {
		console.log('🚀 上传文件到服务器...')
		const { sourceFile, targetZipFolder, targetDeployFolder } = this
		const targetZipFile = path.join(targetZipFolder, 'dist.zip')
		await sshClient.connect()

		console.log(`上传文件 ${sourceFile} 到 ${targetZipFile}`)

		await sshClient.putFile(sourceFile, targetZipFile)
		console.log('✅ 文件上传完成')

		console.log('🔄 执行服务器端部署...')

		let cmd = ''

		// 解压文件
		cmd = `cd ${targetZipFolder} && unzip -o dist.zip`
		await sshClient.execCommand(cmd)

		// 解压后删除 zip 文件
		cmd = `rm -f ${targetZipFile}`
		await sshClient.execCommand(cmd)

		// 清空目标目录
		cmd = `rm -rf ${targetDeployFolder}/*`
		await sshClient.execCommand(cmd)

		// TODO: 理论上备份一下

		// 复制文件 (解压后是 /temp/dist/xxx，复制 /temp/dist/* 到目标目录)
		cmd = `cp -r ${targetZipFolder}/dist/* ${targetDeployFolder}/`
		await sshClient.execCommand(cmd)

		// 清理解压的临时文件
		cmd = `rm -rf ${targetZipFolder}/*`
		await sshClient.execCommand(cmd)

		await sshClient.disconnect()
	}

	async uploadHtmlToServer() {
		console.log('🚀 上传 index.html 到服务器...')
		const { targetDeployFolder } = this
		const indexHtmlPath = path.join(this.sourceFolder, 'index.html')

		// 检查 index.html 是否存在
		if (!fs.existsSync(indexHtmlPath)) {
			throw new Error('index.html 文件不存在，请先执行构建')
		}

		await sshClient.connect()

		// 清空目标目录
		const cmd = `rm -rf ${targetDeployFolder}/*`
		await sshClient.execCommand(cmd)

		// 直接上传 index.html
		const targetIndexPath = path.join(targetDeployFolder, 'index.html')
		await sshClient.putFile(indexHtmlPath, targetIndexPath)
		console.log('✅ index.html 上传完成')

		await sshClient.disconnect()
	}
}

export const deployTool = new DeployTool()

export interface DeployConfig {
	host: string // 部署nginx服务器
	username?: string
	privateKeyPath?: string
	verbose?: boolean
	onlyOss?: boolean // 激活oss时，不部署到服务器
	dryRun?: boolean // 只打印日志，不执行实际操作
}
