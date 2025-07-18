import OSS from 'ali-oss'
import axios from 'axios'
import { OssClientConfig, OssUploadResult } from './oss-types'
import { ossUtil } from './oss-util'
import { ossBucket, ossRegion } from '../env'

/**
 * 前端公共客户端
 *
 * 支持公读公写bucket和AccessKey方式
 */
class OssPubClient {
	config: OssClientConfig
	oss: OSS | null = null
	hasAk = false

	init(config: OssClientConfig) {
		this.config = config
		const { accessKeyId, accessKeySecret } = config

		if (accessKeyId && accessKeySecret) {
			this.oss = new OSS({ accessKeyId, accessKeySecret, bucket: ossBucket, region: ossRegion })
			this.hasAk = true
		} else {
			this.oss = null
			this.hasAk = false
		}
	}

	async uploadFile(file: File) {
		if (!this.oss) throw new Error('[OSS] Client not initialized')

		const { objectKey, hashifyName } = ossUtil.getUploadInfo(file.name, file.type)
		await this.oss.put(objectKey, file)
		const url = this.getUrl(objectKey)

		return {
			url,
			objectKey,
			hashifyName,
			size: file.size,
			type: file.type,
			uploadTime: new Date().toISOString(),
		} as OssUploadResult
	}

	async publicUploadFile(file: File) {
		const { objectKey, hashifyName } = ossUtil.getUploadInfo(file.name, file.type)
		const url = this.getPublicUrl(objectKey)

		const res = await axios.put(url, file, {
			headers: { 'Content-Type': file.type },
		})

		if (res.status !== 200) throw new Error(`[OSS] Upload failed: ${res.statusText}`)

		return {
			url,
			objectKey,
			hashifyName,
			size: file.size,
			type: file.type,
			uploadTime: new Date().toISOString(),
		} as OssUploadResult
	}

	getPublicUrl(objectKey: string) {
		return `https://${ossBucket}.${ossRegion}.aliyuncs.com/${objectKey}`
	}

	getUrl(objectKey: string) {
		if (!this.oss) throw new Error('[OSS] Client not initialized')
		return this.oss.signatureUrl(objectKey)
	}

	async deleteFile(objectKey: string) {
		if (!this.oss) throw new Error('[OSS] Client not initialized')
		await this.oss.delete(objectKey)
	}

	async publicDeleteFile(objectKey: string) {
		const url = this.getPublicUrl(objectKey)
		const res = await axios.delete(url, { timeout: 3000 })
		if (res.status !== 200) throw new Error(`[OSS] Delete failed: ${res.status} ${res.statusText}`)
	}
}

export const ossPubClient = new OssPubClient()
