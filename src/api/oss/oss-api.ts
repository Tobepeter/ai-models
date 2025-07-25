import { axClient } from '../ax-client'
import { OSSSTSResp, OSSSignReq, OSSSignResp, OSSHashifyNameReq, OSSHashifyNameResp, OSSFileUploadResp, OSSFileDeleteReq, OSSFileUrlReq, OSSFileUrlResp } from '../types/api-types'
import { ApiResp } from '../common'

// OSS 后端接口，不过其实前端实现了一个一样的了，这个不一定维护了
class OSSApi {
	// sts凭证
	async getSTSCredentials() {
		const res = await axClient.post<ApiResp<OSSSTSResp>>('/oss/sts')
		if (res.data.code !== 200) throw new Error(res.data.msg || '获取STS凭证失败')
		return res.data.data!
	}

	// 上传签名
	async signToUpload(data: OSSSignReq) {
		const res = await axClient.post<ApiResp<OSSSignResp>>('/oss/sign-to-upload', data)
		if (res.data.code !== 200) throw new Error(res.data.msg || '获取上传签名失败')
		return res.data.data!
	}

	// 下载签名
	async signToFetch(data: OSSSignReq) {
		const res = await axClient.post<ApiResp<OSSSignResp>>('/oss/sign-to-fetch', data)
		if (res.data.code !== 200) throw new Error(res.data.msg || '获取下载签名失败')
		return res.data.data!
	}

	// 生成哈希文件名
	async hashifyName(data: OSSHashifyNameReq) {
		const res = await axClient.post<ApiResp<OSSHashifyNameResp>>('/oss/hashify-name', data)
		if (res.data.code !== 200) throw new Error(res.data.msg || '生成哈希文件名失败')
		return res.data.data!
	}

	// 获取文件列表
	async getFileList() {
		const res = await axClient.get<ApiResp<string[]>>('/oss/files')
		if (res.data.code !== 200) throw new Error(res.data.msg || '获取文件列表失败')
		return res.data.data!
	}

	// 上传文件
	async uploadFile(file: File, objectKey?: string) {
		const formData = new FormData()
		formData.append('file', file)
		if (objectKey) {
			formData.append('objectKey', objectKey)
		}

		const res = await axClient.post<ApiResp<OSSFileUploadResp>>('/oss/upload', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})
		if (res.data.code !== 200) throw new Error(res.data.msg || '上传文件失败')
		return res.data.data!
	}

	// 删除文件
	async deleteFile(data: OSSFileDeleteReq) {
		const res = await axClient.post<ApiResp<void>>('/oss/delete', data)
		if (res.data.code !== 200) throw new Error(res.data.msg || '删除文件失败')
	}

	// 获取文件URL
	async getFileURL(data: OSSFileUrlReq) {
		const res = await axClient.post<ApiResp<OSSFileUrlResp>>('/oss/get-url', data)
		if (res.data.code !== 200) throw new Error(res.data.msg || '获取文件URL失败')
		return res.data.data!
	}
}

export const ossApi = new OSSApi()
