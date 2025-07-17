import { ossApiClient } from './oss-api-client'
import { ossPubClient } from './oss-pub-client'
import { ossStsClient } from './oss-sts-client'
import { OssAccessType, OssClientConfig } from './oss-types'

// OSS权限配置
const OSS_READ_ACCESS: OssAccessType = (import.meta.env.VITE_OSS_READ_ACCESS as OssAccessType) || OssAccessType.Sts
const OSS_WRITE_ACCESS: OssAccessType = (import.meta.env.VITE_OSS_WRITE_ACCESS as OssAccessType) || OssAccessType.Sts
const OSS_BUCKET = import.meta.env.VITE_OSS_BUCKET || ''
const OSS_REGION = import.meta.env.VITE_OSS_REGION || ''
const OSS_ACCESS_KEY = import.meta.env.VITE_OSS_ACCESS_KEY || ''
const OSS_ACCESS_SECRET = import.meta.env.VITE_OSS_ACCESS_SECRET || ''

/**
 * oss 客户端
 *
 * 支持多种方式，纯 sts
 * 纯后端
 * 公共客户端
 */
class OssClient {
	init() {
		ossPubClient.init({
			accessKeyId: OSS_ACCESS_KEY,
			accessKeySecret: OSS_ACCESS_SECRET,
			bucket: OSS_BUCKET,
			region: OSS_REGION,
		})
	}

	update(config: OssClientConfig) {
		ossPubClient.init(config)
	}

	uploadFile(file: File) {
		switch (OSS_WRITE_ACCESS) {
			case OssAccessType.Pub:
				return ossPubClient.publicUploadFile(file)
			case OssAccessType.Ak:
				if (!ossPubClient.hasAk) throw new Error('[OSS] AccessKey not configured')
				return ossPubClient.uploadFile(file)
			case OssAccessType.Api:
				return ossApiClient.uploadFile(file)
			case OssAccessType.Sts:
			default:
				return ossStsClient.uploadFile(file)
		}
	}

	deleteFile(objectKey: string) {
		switch (OSS_WRITE_ACCESS) {
			case OssAccessType.Pub:
				return ossPubClient.publicDeleteFile(objectKey)
			case OssAccessType.Ak:
				return ossPubClient.deleteFile(objectKey)
			case OssAccessType.Api:
				return ossApiClient.deleteFile(objectKey)
			case OssAccessType.Sts:
			default:
				return ossStsClient.deleteFile(objectKey)
		}
	}

	async getFileUrl(objectKey: string) {
		switch (OSS_READ_ACCESS) {
			case OssAccessType.Pub:
				return ossPubClient.getPublicUrl(objectKey)
			case OssAccessType.Ak:
				return ossPubClient.getUrl(objectKey)
			case OssAccessType.Api:
				return await ossApiClient.getFileUrl(objectKey)
			case OssAccessType.Sts:
			default:
				return ossStsClient.getOssUrl(objectKey)
		}
	}
}

export const ossClient = new OssClient()
