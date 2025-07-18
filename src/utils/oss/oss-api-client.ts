import axios from 'axios'
import { ossConfig } from './oss-config'
import { ossUtil } from './oss-util'
import { OssBaseResp, OssSignToUploadData, SignToFetchData, OssHashifyNameData, OssApiUploadData, OssApiGetUrlData, OssUploadResult, OssUploadOpt } from './oss-types'

/**
 * OSS 基于后端的API
 */
class OssApiClient {
	/**
	 * 签名模式
	 *
	 * true: 后端签名后，前端直接调用 OSS
	 * false: 后端全权代理操作，前端只调用后端接口
	 *
	 * 一般不建议开，api用起来太笨重了
	 * 后端都可以直接访问阿里云，直接操作就好了
	 */
	signMode = false

	private client = axios.create({
		baseURL: ossConfig.apiBaseUrl,
		timeout: 3000,
	})

	setSignMode(enabled: boolean) {
		this.signMode = enabled
	}

	async uploadFile(file: File, options?: OssUploadOpt): Promise<OssUploadResult> {
		if (this.signMode) {
			return this.uploadFileBySign(file, options)
		} else {
			return this.uploadFileByAPI(file, options)
		}
	}

	private async uploadFileBySign(file: File, options?: OssUploadOpt): Promise<OssUploadResult> {
		let objectKey: string
		let hashifyName: string
		const { prefix, fileName, noPreview, onProgress } = options || {}

		if (prefix || fileName) {
			// 自定义路径和文件名
			const finalFileName = fileName || file.name
			hashifyName = ossUtil.hashifyName(finalFileName)

			if (prefix) {
				const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`
				objectKey = normalizedPrefix + hashifyName
			} else {
				objectKey = hashifyName
			}
		} else {
			// 使用默认的智能路径生成
			const uploadInfo = ossUtil.getUploadInfo(file.name, file.type)
			objectKey = uploadInfo.objectKey
			hashifyName = uploadInfo.hashifyName
		}

		const res = await this.client.post<OssBaseResp<OssSignToUploadData>>('/sign-to-upload', {
			objectKey,
			fileType: file.type || 'application/octet-stream',
		})

		if (res.data.code !== 0) throw new Error(res.data.msg)
		const { signedUrl } = res.data.data!

		// 直接上传到OSS
		try {
			await axios.put(signedUrl, file, {
				headers: { 'Content-Type': file.type || 'application/octet-stream' },
				timeout: 30000, // 30秒超时
				onUploadProgress: (progressEvent) => {
					if (onProgress && progressEvent.total) {
						const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
						onProgress(percent)
					}
				},
			})
			console.log(`[OSS] 签名模式上传成功: ${objectKey}, 大小: ${file.size}, 类型: ${file.type}`)
		} catch (error: any) {
			console.error(`[OSS] 签名模式上传失败: ${objectKey}`, error)
			throw new Error(`OSS上传失败: ${error.message}`)
		}

		let url: string | undefined = undefined
		if (!noPreview) {
			// NOTE: oss 签名的put和fetch是分开的，需要重新签名url
			url = await this.getFileUrl(objectKey)
		}

		return {
			url,
			objectKey,
			hashifyName,
			size: file.size,
			type: file.type,
			uploadTime: new Date().toISOString(),
		}
	}

	private async uploadFileByAPI(file: File, options?: OssUploadOpt): Promise<OssUploadResult> {
		// 代理模式：后端全权处理，支持传递 prefix 和 fileName
		const { prefix, fileName, noPreview, onProgress } = options || {}

		const formData = new FormData()
		formData.append('file', file)

		// 添加可选参数
		if (prefix) {
			formData.append('prefix', prefix)
		}
		if (fileName) {
			formData.append('fileName', fileName)
		}
		if (noPreview) {
			formData.append('noPreview', 'true')
		}

		try {
			const res = await this.client.post<OssBaseResp<OssApiUploadData>>('/upload', formData, {
				onUploadProgress: (progressEvent) => {
					if (onProgress && progressEvent.total) {
						const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
						onProgress(percent)
					}
				},
			})

			if (res.data.code !== 0) throw new Error(res.data.msg)
			const data = res.data.data!

			console.log(`[OSS] 代理模式上传成功: ${data.objectKey}, 大小: ${data.size}, 类型: ${data.type}`)

			return {
				url: data.url,
				objectKey: data.objectKey,
				hashifyName: data.objectKey, // 后端已经处理了哈希化
				size: data.size,
				type: data.type,
				uploadTime: data.uploadTime,
			}
		} catch (error: any) {
			console.error(`[OSS] 代理模式上传失败:`, error)
			throw new Error(`代理上传失败: ${error.message}`)
		}
	}

	async deleteFile(objectKey: string) {
		// NOTE: OSS签名模式没有
		if (this.signMode) {
			console.warn('[oss] ali-oss 签名模式没有删除接口')
		}

		const res = await this.client.post('/delete', { objectKey })
		return res.data
	}

	async getFileUrl(objectKey: string) {
		if (this.signMode) {
			const res = await this.client.post<OssBaseResp<SignToFetchData>>('/sign-to-fetch', { objectKey })
			if (res.data.code !== 0) throw new Error(res.data.msg)
			return res.data.data?.signedUrl || ''
		} else {
			const res = await this.client.post<OssBaseResp<OssApiGetUrlData>>('/get-url', { objectKey })
			if (res.data.code !== 0) throw new Error(res.data.msg)
			return res.data.data?.url || ''
		}
	}
}

export const ossApiClient = new OssApiClient()
