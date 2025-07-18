import { ossApiClient } from './oss-api-client'
import { ossPubClient } from './oss-pub-client'
import { ossStsClient } from './oss-sts-client'
import { OssAccessType, OssClientConfig } from './oss-types'
import { ossReadAccess, ossWriteAccess } from '../env'
import { ossAccessKeyId, ossAccessKeySecret, ossBucket, ossRegion } from '../env'

/**
 * oss 客户端
 *
 * 支持多种方式，纯 sts
 * 纯后端
 * 公共客户端
 */
class OssClient {
	verbose = true
	read: OssAccessType = ossReadAccess
	write: OssAccessType = ossWriteAccess

	init() {
		ossPubClient.init({
			accessKeyId: ossAccessKeyId,
			accessKeySecret: ossAccessKeySecret,
		})

		if (this.verbose) {
			console.log('[oss] init', {
				readAccess: ossReadAccess,
				writeAccess: ossWriteAccess,
				bucket: ossBucket,
				region: ossRegion,
				accessKeyId: ossAccessKeyId,
				accessKeySecret: ossAccessKeySecret,
			})
		}
	}

	update(config: OssClientConfig) {
		ossPubClient.init(config)
	}

	changeReadAccess(access: OssAccessType) {
		if (access === OssAccessType.Ak) {
			if (!ossPubClient.hasAk) console.error('[oss] accessKey not configured')
			return
		}

		this.read = access
	}

	changeWriteAccess(access: OssAccessType) {
		if (access === OssAccessType.Ak) {
			if (!ossPubClient.hasAk) console.error('[oss] accessKey not configured')
			return
		}

		this.write = access
	}

	uploadFile(file: File) {
		switch (this.write) {
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
		switch (this.write) {
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
		switch (this.read) {
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
