class OssUtil {
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
		const basePath = 'assets/'
		const pathPrefix = fileType ? `${basePath}${fileType}/` : basePath
		const objectKey = pathPrefix + hashifyName
		return {
			objectKey,
			pathPrefix,
			hashifyName,
		}
	}
}

export const ossUtil = new OssUtil()
