import axios from 'axios'
import { ossConfig } from './oss-config'
import { ossUtil } from './oss-util'
import { OssBaseResp, OssSignToUploadData, SignToFetchData, OssHashifyNameData, OssApiUploadData, OssApiGetUrlData, OssUploadResult, OssUploadOpt } from './oss-types'
import { requestConfig } from '@/config/request-config'

/** 内部使用的上传解析选项 */
interface OssUploadParseOpt {
	prefix?: string
	fileName?: string
	objectKey: string
	hashifyName: string
	noPreview?: boolean
	onProgress?: (percent: number) => void
}

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
		timeout: requestConfig.timeout,
	})

	setSignMode(enabled: boolean) {
		this.signMode = enabled
	}

	async uploadFile(file: File, options?: OssUploadOpt): Promise<OssUploadResult> {
		const { prefix, fileName, objectKey: providedObjectKey, noProcessObjectKey, noPreview, onProgress } = options || {}

		let objectKey: string
		let hashifyName: string

		// 优先级1: 如果直接提供了objectKey，直接使用
		if (providedObjectKey) {
			objectKey = providedObjectKey
			// 从objectKey中提取hashifyName（取最后一个/后的部分）
			hashifyName = objectKey.split('/').pop() || objectKey
		}
		// 优先级2: 默认前端计算路径（除非设置了noProcessObjectKey=true）
		else if (!noProcessObjectKey) {
			const uploadInfo = ossUtil.getUploadInfo(fileName || file.name, file.type)
			hashifyName = uploadInfo.hashifyName

			// 如果还有prefix，拼接在智能路径和hashifyName之间
			if (prefix) {
				const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`
				objectKey = uploadInfo.pathPrefix + normalizedPrefix + hashifyName
			} else {
				objectKey = uploadInfo.objectKey
			}
		}
		// 优先级3: noProcessObjectKey=true，传给后端计算
		else {
			// 这种情况下objectKey为空，让后端计算
			objectKey = ''
			hashifyName = '' // 后端会计算
		}

		const parseOpt: OssUploadParseOpt = {
			objectKey,
			hashifyName,
			prefix,
			fileName,
			noPreview,
			onProgress,
		}

		if (this.signMode) {
			return this.uploadFileBySign(file, parseOpt)
		} else {
			return this.uploadFileByAPI(file, parseOpt)
		}
	}

	private async uploadFileBySign(file: File, opt: OssUploadParseOpt): Promise<OssUploadResult> {
		const { objectKey, hashifyName, prefix, fileName, noPreview, onProgress } = opt

		// 构建签名请求
		const signRequest: any = {
			fileType: file.type || 'application/octet-stream',
		}

		// 如果有完整的objectKey，直接使用
		if (objectKey) {
			signRequest.objectKey = objectKey
		} else {
			// 否则传递prefix和fileName，让后端计算路径
			if (prefix) signRequest.prefix = prefix
			if (fileName) signRequest.fileName = fileName
		}

		const res = await this.client.post<OssBaseResp<OssSignToUploadData>>('/oss/sign-to-upload', signRequest)

		if (res.data.code !== 0) throw new Error(res.data.msg)
		const { signedUrl, objectKey: finalObjectKey } = res.data.data!

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
			console.log(`[OSS] 签名模式上传成功: ${finalObjectKey}, 大小: ${file.size}, 类型: ${file.type}`)
		} catch (error: any) {
			console.error(`[OSS] 签名模式上传失败: ${finalObjectKey}`, error)
			throw new Error(`OSS上传失败: ${error.message}`)
		}

		let url: string | undefined = undefined
		if (!noPreview) {
			// NOTE: oss 签名的put和fetch是分开的，需要重新签名url
			url = await this.getFileUrl(finalObjectKey)
		}

		// 计算最终的hashifyName
		const finalHashifyName = hashifyName || finalObjectKey.split('/').pop() || finalObjectKey

		return {
			url,
			objectKey: finalObjectKey,
			hashifyName: finalHashifyName,
			size: file.size,
			type: file.type,
			uploadTime: new Date().toISOString(),
		}
	}

	private async uploadFileByAPI(file: File, opt: OssUploadParseOpt): Promise<OssUploadResult> {
		const { objectKey, hashifyName, prefix, fileName, noPreview, onProgress } = opt

		const formData = new FormData()
		formData.append('file', file)

		// 如果有完整的objectKey，直接传递给后端
		if (objectKey) {
			formData.append('objectKey', objectKey)
		}

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
			const res = await this.client.post<OssBaseResp<OssApiUploadData>>('/oss/upload', formData, {
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

			// 如果后端返回了hashifyName，使用后端的；否则使用前端计算的
			const finalHashifyName = data.hashifyName || hashifyName || data.objectKey.split('/').pop() || data.objectKey

			return {
				url: data.url,
				objectKey: data.objectKey,
				hashifyName: finalHashifyName,
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

		const res = await this.client.post('/oss/delete', { objectKey })
		return res.data
	}

	async getFileUrl(objectKey: string) {
		if (this.signMode) {
			const res = await this.client.post<OssBaseResp<SignToFetchData>>('/oss/sign-to-fetch', { objectKey })
			if (res.data.code !== 0) throw new Error(res.data.msg)
			return res.data.data?.signedUrl || ''
		} else {
			const res = await this.client.post<OssBaseResp<OssApiGetUrlData>>('/oss/get-url', { objectKey })
			if (res.data.code !== 0) throw new Error(res.data.msg)
			return res.data.data?.url || ''
		}
	}
}

export const ossApiClient = new OssApiClient()
