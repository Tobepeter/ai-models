import OSS from 'ali-oss'
import { ossAccessKeyId, ossAccessKeySecret, ossBucket, ossRegion, ossRoleArn } from './env'

class OssAPI {
	oss: OSS
	// NOTE: import 不能用解构语法，代码实际是并未导出
	sts: OSS.STS

	init() {
		const keys = {
			accessKeyId: ossAccessKeyId,
			accessKeySecret: ossAccessKeySecret,
			bucket: ossBucket,
			region: ossRegion,
			roleArn: ossRoleArn,
		}
		const validKeys = Object.values(keys).every((value) => value !== '')
		if (!validKeys) throw new Error(`[oss] 配置不完整，请检查 env 配置: ${JSON.stringify(keys)}`)

		this.oss = new OSS({
			region: ossRegion,
			accessKeyId: ossAccessKeyId,
			accessKeySecret: ossAccessKeySecret,
			bucket: ossBucket,
		})

		this.sts = new OSS.STS({
			// NOTE：sts 其实是通用服务，和 oss 的 bucket 信息无关
			accessKeyId: ossAccessKeyId,
			accessKeySecret: ossAccessKeySecret,
		})
	}

	async getStsToken() {
		const result = await this.sts.assumeRole(ossRoleArn, '', 3600)
		return result
	}

	signToFetch(objectKey: string) {
		const url = this.oss.signatureUrl(objectKey, {
			method: 'GET',
			expires: 3600,
		})
		return url
	}

	signToUpload(objectKey: string, fileType: string) {
		const url = this.oss.signatureUrl(objectKey, {
			method: 'PUT',
			expires: 3600,
			'Content-Type': fileType,
		})
		return url
	}

	async getFileList(prefix = '', maxKeys = 100): Promise<FileListResult> {
		const result = await this.oss.list(
			{
				prefix,
				'max-keys': maxKeys,
			},
			{}
		)

		const files =
			result.objects?.map((obj) => ({
				name: obj.name,
				size: obj.size,
				lastModified: obj.lastModified,
				objectKey: obj.name,
				url: this.signToFetch(obj.name),
			})) || []

		return {
			files,
			isTruncated: result.isTruncated,
			nextMarker: result.nextMarker,
		}
	}

	getPublicUrl(objectKey: string) {
		return `https://${ossBucket}.${ossRegion}.aliyuncs.com/${objectKey}`
	}

	/**
	 * 防止oss名字冲突
	 *
	 * 返回类似: avatar_1642579200000_abc123.jpg
	 */
	hashifyName(fileName: string) {
		const name = fileName.split('/').pop() || 'unknown'
		const timestamp = Date.now()
		const randomStr = Math.random().toString(36).substring(2, 8)
		const ext = name.substring(name.lastIndexOf('.'))
		const nameWithoutExt = name.substring(0, name.lastIndexOf('.'))
		return `${nameWithoutExt}_${timestamp}_${randomStr}${ext}`
	}

	/** 直接上传文件 */
	async uploadFile(buffer: Buffer, objectKey: string, contentType: string) {
		const result = await this.oss.put(objectKey, buffer, {
			headers: { 'Content-Type': contentType },
		})
		return result
	}

	/** 删除文件 */
	async deleteFile(objectKey: string) {
		await this.oss.delete(objectKey)
	}

	/** 获取文件访问URL */
	getFileUrl(objectKey: string) {
		return this.oss.signatureUrl(objectKey, { expires: 3600 })
	}
}

export const ossAPI = new OssAPI()

export interface FileListResult {
	files: Array<{
		name: string
		size: number
		lastModified: string
		objectKey: string
		url: string
	}>
	isTruncated: boolean
	nextMarker?: string
}
