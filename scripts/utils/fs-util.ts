import fs from 'fs'
import fse from 'fs-extra'
import path from 'path'
import archiver from 'archiver'
import { createWriteStream } from 'fs'

class FsUtil {
	/** 递归获取文件夹中的所有文件 */
	getAllFiles(dirPath: string, opt?: FsGetAllFilesOpt): string[] {
		const { exclude = [], filter, noRelative = false } = opt || {}

		const items = fs.readdirSync(dirPath, { recursive: true, withFileTypes: true })
		return items
			.filter((item) => item.isFile())
			.map((item) => {
				const fullPath = path.join(item.parentPath, item.name)
				return noRelative ? fullPath : path.relative(dirPath, fullPath)
			})
			.filter((filePath) => {
				if (exclude.length === 0 && !filter) {
					return true
				}

				const relPath = noRelative ? filePath : path.relative(dirPath, filePath)
				if (exclude.length > 0 && exclude.includes(relPath)) {
					return false
				}
				if (filter && !filter(relPath)) {
					return false
				}
				return true
			})
	}

	getContentType(filePath: string) {
		const ext = path.extname(filePath).toLowerCase()
		const contentTypes: Record<string, string> = {
			'.html': 'text/html',
			'.css': 'text/css',
			'.js': 'application/javascript',
			'.json': 'application/json',
			'.png': 'image/png',
			'.jpg': 'image/jpeg',
			'.jpeg': 'image/jpeg',
			'.gif': 'image/gif',
			'.svg': 'image/svg+xml',
			'.ico': 'image/x-icon',
			'.woff': 'font/woff',
			'.woff2': 'font/woff2',
			'.ttf': 'font/ttf',
			'.eot': 'application/vnd.ms-fontobject',
		}

		return contentTypes[ext] || 'application/octet-stream'
	}

	posixPath(filePath: string) {
		return filePath.replace(/\\/g, '/')
	}

	/** 创建zip */
	async createZip(sourceDir: string, outputFile: string): Promise<void> {
		await fse.ensureDir(path.dirname(outputFile))

		return new Promise((resolve, reject) => {
			const output = createWriteStream(outputFile)
			const archive = archiver('zip', { zlib: { level: 9 } })

			output.on('close', () => resolve())
			archive.on('error', reject)

			archive.pipe(output)
			// 使用 false 作为第二个参数，不创建目录结构，不然解压会有嵌套
			const destpath = false
			archive.directory(sourceDir, destpath)
			archive.finalize()
		})
	}

	/** 解压zip */
	async extractZip(zipFile: string, destDir: string): Promise<void> {
		await fse.ensureDir(destDir)

		try {
			const AdmZip = (await import('adm-zip')).default
			const zip = new AdmZip(zipFile)
			zip.extractAllTo(destDir, true)
		} catch (error: any) {
			throw new Error(`解压失败: ${error.message}`)
		}
	}
}

export const fsUtil = new FsUtil()

export interface FsGetAllFilesOpt {
	exclude?: string[]
	filter?: (relPath: string) => boolean
	noRelative?: boolean // 是否不返回相对路径
}
