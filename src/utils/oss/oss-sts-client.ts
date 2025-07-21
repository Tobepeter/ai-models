import OSS, { type Credentials } from 'ali-oss'
import axios from 'axios'
import { storage } from '@/utils/storage'
import { ossConfig } from './oss-config'
import { OssBaseResp, OssSTSRespData, OssUploadResult } from './oss-types'
import { ossUtil } from './oss-util'
import { ossRegion, ossBucket } from '../env'

/**
 * 前端OSS客户端（基于STS）
 */
class OssStsClient {
	oss: OSS
	token: Credentials | null = null
	verbose = true

	/** 计算STS凭证过期时间，提前过期方便过渡 */
	private getStsExpire(expir: string) {
		return new Date(expir).getTime() - ossConfig.stsAheadMin * 60 * 1000
	}

	isValid() {
		if (!this.token) return false
		const expiry = this.getStsExpire(this.token.Expiration)
		return Date.now() < expiry
	}

	/** 获取STS临时凭证 */
	async getToken(): Promise<Credentials> {
		const resp = await axios.post<OssBaseResp<OssSTSRespData>>(`${ossConfig.apiBaseUrl}/sts`)
		const { data } = resp
		if (data.code !== 0) throw new Error(data.msg || 'Failed to get STS token')
		const token = data.data.credentials

		this.token = token
		this.cacheToken(token)
		if (this.verbose) {
			console.log('[OSS] STS token refreshed, expires:', new Date(token.Expiration).toLocaleString())
		}
		return token
	}

	/** 缓存STS凭证 */
	private cacheToken(token: Credentials) {
		const cacheData = { token, expiry: this.getStsExpire(token.Expiration) }
		storage.setAppData({ ossStsCache: cacheData })
	}

	/** 检查并获取有效的STS凭证 */
	async getValidStsToken(): Promise<Credentials> {
		// 检查内存缓存
		if (this.isValid() && this.oss) return this.token!

		// 检查localStorage
		let token: Credentials | null = null
		try {
			const appData = storage.getAppData()
			const cached = appData.ossStsCache
			if (cached && Date.now() < cached.expiry) {
				token = cached.token
			}
		} catch (error) {
			if (this.verbose) console.warn('[OSS] Failed to parse STS cache:', error)
			storage.setAppData({ ossStsCache: undefined })
		}

		// 获取新凭证
		if (!token) {
			if (this.verbose) console.log('[OSS] STS cache expired, fetching new token')
			token = await this.getToken()
		}

		this.token = token
		this.refreshOss() // STS更新时刷新OSS客户端
		return token
	}

	/** 上传文件到OSS */
	async uploadFile(file: File, onProgress?: (percent: number) => void): Promise<OssUploadResult> {
		await this.getValidStsToken()
		const { objectKey, hashifyName } = ossUtil.getUploadInfo(file.name, file.type)

		await this.oss.put(objectKey, file, {
			progress: (p: any) => onProgress?.(Math.round(p * 100)),
		} as any)

		const url = this.getOssUrl(objectKey)
		if (this.verbose) console.log(`[OSS] STS upload success: ${url}`)

		return {
			url,
			objectKey,
			hashifyName,
			size: file.size,
			type: file.type,
			uploadTime: new Date().toISOString(),
		}
	}

	async refreshOss() {
		if (!this.token) throw new Error('[OSS] Cannot refresh OSS client: STS token not found')

		this.oss = new OSS({
			accessKeyId: this.token.AccessKeyId,
			accessKeySecret: this.token.AccessKeySecret,
			region: ossRegion,
			bucket: ossBucket,
			stsToken: this.token.SecurityToken,
		})
	}

	/** 删除OSS文件 */
	async deleteFile(objectKey: string) {
		await this.getValidStsToken()
		await this.oss.delete(objectKey)
		if (this.verbose) console.log(`[OSS] STS delete success: ${objectKey}`)
	}

	/** 获取STS签名URL */
	getOssUrl(objectKey: string) {
		if (!this.token) throw new Error('[OSS] STS token not found')
		if (!this.oss) throw new Error('[OSS] OSS client not found')

		// 计算STS剩余有效时间
		const stsRemainingTime = Math.floor((new Date(this.token.Expiration).getTime() - Date.now()) / 1000)

		// 签名有效期不能超过STS剩余时间，留60秒缓冲
		const maxExpires = Math.min(3600, stsRemainingTime - 60)
		const expires = Math.max(300, maxExpires) // 最少5分钟

		return this.oss.signatureUrl(objectKey, { expires }) || ''
	}
}

export const ossStsClient = new OssStsClient()
