import axios from 'axios'
import { ossConfig } from './oss-config'

/**
 * OSS 基于后端的API
 */
class OssApiClient {
	private client = axios.create({
		baseURL: ossConfig.apiBaseUrl,
		timeout: 3000,
	})

	async uploadFile(file: File) {
		const formData = new FormData()
		formData.append('file', file)
		const res = await this.client.post('/upload', formData)
		return res.data
	}

	async deleteFile(objectKey: string) {
		const res = await this.client.post('/delete', { objectKey })
		return res.data
	}

	async getFileUrl(objectKey: string) {
		const res = await this.client.post('/get-url', { objectKey })
		return res.data
	}
}

export const ossApiClient = new OssApiClient()
