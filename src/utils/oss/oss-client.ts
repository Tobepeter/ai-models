import axios from 'axios'
import OSS from 'ali-oss'
import { STSCredentials, STSResponse, DeleteResponse, UploadResult } from './oss-types'
import { ossConfig } from './oss-config'

class OssClient {
	private oss: OSS | null = null
	private stsData: STSCredentials | null = null

	/**
	 * 计算STS凭证过期时间
	 * 提前过期，方便过渡
	 */
	private getStsExpire(expir: string) {
		return new Date(expir).getTime() - ossConfig.stsAheadMin * 60 * 1000
	}

	isValid() {
		const { stsData: stsCredentials } = this
		if (!stsCredentials) return false
		const expiry = this.getStsExpire(stsCredentials.expiration)
		return Date.now() < expiry
	}

	/** 检查服务器状态 */
	async checkServerStatus() {
		try {
			const resp = await axios.get(`${ossConfig.apiBaseUrl}/files?maxKeys=1`)
			return resp.data.code === 0
		} catch (error) {
			return false
		}
	}

	/** 获取STS临时凭证 */
	async getStsCredentials(): Promise<STSCredentials> {
		const resp = await axios.post<STSResponse>(`${ossConfig.apiBaseUrl}/sts`)
		const { data } = resp
		if (data.code !== 0) {
			throw new Error(data.msg || '获取STS凭证失败')
		}
		const { accessKeyId, accessKeySecret, stsToken, expiration } = data.data
		const credentials: STSCredentials = {
			accessKeyId,
			accessKeySecret,
			securityToken: stsToken,
			expiration,
			region: ossConfig.region,
			bucket: ossConfig.bucket,
			endpoint: ossConfig.endpoint,
		}
		this.stsData = credentials

		// 缓存到localStorage，提前过期
		const cacheData = {
			credentials,
			expiry: this.getStsExpire(credentials.expiration),
		}
		localStorage.setItem('oss_sts_cache', JSON.stringify(cacheData))

		console.log('[STS] 获取新凭证成功，过期时间:', new Date(credentials.expiration).toLocaleString())
		return credentials
	}

	/** 检查并获取有效的STS凭证 */
	async getValidStsCredentials(): Promise<STSCredentials> {
		// 检查内存缓存
		if (this.isValid() && this.oss) {
			console.log('[STS] 使用内存缓存凭证和OSS客户端')
			return this.stsData
		}

		// 检查localStorage
		let stsCredentials: STSCredentials | null = null
		try {
			const cached = localStorage.getItem('oss_sts_cache')
			if (cached) {
				const { credentials, expiry } = JSON.parse(cached)
				if (Date.now() < expiry) {
					stsCredentials = credentials
				}
			}
		} catch (error) {
			console.warn('[STS] 解析缓存失败:', error)
		}

		// 获取新凭证
		if (!stsCredentials) {
			console.log('[STS] 缓存过期或不存在，获取新凭证')
			stsCredentials = await this.getStsCredentials()
		}

		this.stsData = stsCredentials

		// sts只要更新，就刷新OSS客户端
		this.refreshOss()
		return stsCredentials
	}

	getOssName(fileName: string) {
		const name = fileName.split('/').pop() || 'unknown'
		const timestamp = Date.now()
		const randomStr = Math.random().toString(36).substring(2, 8)
		const ext = name.substring(name.lastIndexOf('.'))
		const nameWithoutExt = name.substring(0, name.lastIndexOf('.'))
		return `${nameWithoutExt}_${timestamp}_${randomStr}${ext}`
	}

	/** 上传文件到OSS */
	async uploadFile(file: File, onProgress?: (percent: number) => void): Promise<UploadResult> {
		await this.getValidStsCredentials()
		const fileName = this.getOssName(file.name)

		// 根据文件类型确定路径前缀
		let pathPrefix = 'assets/files/'
		if (file.type.startsWith('image/')) {
			pathPrefix = 'assets/images/'
		} else if (file.type.startsWith('video/')) {
			pathPrefix = 'assets/videos/'
		}

		const objectKey = pathPrefix + fileName

		const ossClient = this.oss

		// 使用OSS SDK上传文件
		await ossClient.put(objectKey, file, {
			progress: (p: any) => {
				onProgress?.(Math.round(p * 100))
			},
		} as any)

		// const accessUrl = `https://${credentials.bucket}.${credentials.region}.aliyuncs.com/${objectKey}`
		const accessUrl = this.getOssUrl(objectKey)

		// 返回结果
		const result: UploadResult = {
			url: accessUrl,
			objectKey,
			size: file.size,
			type: file.type,
			uploadTime: new Date().toISOString(),
		}

		console.log('[OSS] 上传文件成功，访问URL:', accessUrl)

		return result
	}

	async refreshOss() {
		if (!this.stsData) {
			console.error('[OSS] 无法刷新OSS客户端，STS凭证不存在')
			return
		}

		const { region, accessKeyId, accessKeySecret, securityToken, bucket } = this.stsData
		this.oss = new OSS({
			region,
			accessKeyId,
			accessKeySecret,
			stsToken: securityToken,
			bucket,
		})
	}

	/** 删除OSS文件 */
	async deleteFile(objectKey: string) {
		try {
			const response = await axios.delete<DeleteResponse>(`${ossConfig.apiBaseUrl}/file`, {
				data: { objectKey },
			})
			return response.data.code === 0
		} catch (error) {
			console.error('OSS删除失败:', error)
			return false
		}
	}

	/** 获取STS凭证状态 */
	getStsCredentialsStatus(): { hasCredentials: boolean; expiration?: string } {
		if (this.stsData) {
			return {
				hasCredentials: true,
				expiration: this.stsData.expiration,
			}
		}
		return { hasCredentials: false }
	}

	/**
	 * 获取带签名的OSS访问URL
	 */
	getOssUrl(objectKey: string) {
		if (!this.stsData) {
			console.error('STS凭证不存在')
			return ''
		}

		if (!this.oss) {
			console.error('OSS客户端不存在')
			return ''
		}

		// 计算STS剩余有效时间
		const stsExpiration = new Date(this.stsData.expiration) // STS过期时间
		const now = new Date()
		const stsRemainingTime = Math.floor((stsExpiration.getTime() - now.getTime()) / 1000)

		// 签名有效期不能超过STS剩余时间，并且留一些缓冲时间
		const maxExpires = Math.min(3600, stsRemainingTime - 60) // 减去60秒作为缓冲
		const minMinutes = 5 // 最少5分钟
		const expires = Math.max(minMinutes * 60, maxExpires)

		return this.oss.signatureUrl(objectKey, { expires }) || ''
	}
}

// 创建单例实例
export const ossClient = new OssClient()
