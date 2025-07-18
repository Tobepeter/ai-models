import fs from 'fs'
import path from 'path'

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

	/** 获取 Content-Type */
	getContentType(filePath: string): string {
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

	posixPath(filePath: string): string {
		return filePath.replace(/\\/g, '/')
	}
}

export const fsUtil = new FsUtil()

export interface FsGetAllFilesOpt {
	exclude?: string[]
	filter?: (relPath: string) => boolean
	noRelative?: boolean // 是否不返回相对路径
}
