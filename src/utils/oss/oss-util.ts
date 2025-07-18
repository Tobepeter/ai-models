class OssUtil {
	basePath = 'assets/'
	folderByType = {
		image: 'images/',
		video: 'videos/',
		audio: 'audios/',
		default: 'files/',
	}

	/**
	 * 防止oss名字冲突
	 *
	 * 返回类似: avatar_1642579200000_abc123.jpg
	 * 后端也有类似的代码，如果使用的是后端上传
	 */
	hashifyName(fileName: string): string {
		const name = fileName.split('/').pop() || 'unknown'
		const timestamp = Date.now()
		const randomStr = Math.random().toString(36).substring(2, 8)
		const ext = name.substring(name.lastIndexOf('.'))
		const nameWithoutExt = name.substring(0, name.lastIndexOf('.'))
		return `${nameWithoutExt}_${timestamp}_${randomStr}${ext}`
	}

	getUploadInfo(fileName: string, fileType?: string) {
		const hashifyName = this.hashifyName(fileName)
		const pathPrefix = fileType ? `${this.basePath}${this.getFolderByType(fileType)}` : this.basePath
		const objectKey = pathPrefix + hashifyName
		return {
			objectKey,
			pathPrefix,
			hashifyName,
		}
	}

	getFolderByType(type: string) {
		const keys = Object.keys(this.folderByType)
		for (const key of keys) {
			if (type.startsWith(key)) {
				return this.folderByType[key]
			}
		}
		return this.folderByType.default
	}
}

export const ossUtil = new OssUtil()
