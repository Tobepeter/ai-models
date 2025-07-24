import { axClient } from '../ax-client'
import { 
  OSSSTSResp, 
  OSSSignReq, 
  OSSSignResp, 
  OSSHashifyNameReq, 
  OSSHashifyNameResp,
  OSSFileUploadResp,
  OSSFileDeleteReq,
  OSSFileUrlReq,
  OSSFileUrlResp
} from '../types/api-types'
import { ApiResponse } from '../common'

/** OSS相关API类 */
class OSSApi {

  /** 获取STS临时凭证 */
  async getSTSCredentials() {
    const response = await axClient.post<ApiResponse<OSSSTSResp>>('/oss/sts')
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取STS凭证失败')
    return response.data.data!
  }

  /** 获取上传签名 */
  async signToUpload(data: OSSSignReq) {
    const response = await axClient.post<ApiResponse<OSSSignResp>>('/oss/sign-to-upload', data)
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取上传签名失败')
    return response.data.data!
  }

  /** 获取下载签名 */
  async signToFetch(data: OSSSignReq) {
    const response = await axClient.post<ApiResponse<OSSSignResp>>('/oss/sign-to-fetch', data)
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取下载签名失败')
    return response.data.data!
  }

  /** 生成哈希文件名 */
  async hashifyName(data: OSSHashifyNameReq) {
    const response = await axClient.post<ApiResponse<OSSHashifyNameResp>>('/oss/hashify-name', data)
    if (response.data.code !== 200) throw new Error(response.data.msg || '生成哈希文件名失败')
    return response.data.data!
  }

  /** 获取文件列表 */
  async getFileList() {
    const response = await axClient.get<ApiResponse<string[]>>('/oss/files')
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取文件列表失败')
    return response.data.data!
  }

  /** 上传文件（代理模式） */
  async uploadFile(file: File, objectKey?: string) {
    const formData = new FormData()
    formData.append('file', file)
    if (objectKey) {
      formData.append('objectKey', objectKey)
    }

    const response = await axClient.post<ApiResponse<OSSFileUploadResp>>('/oss/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (response.data.code !== 200) throw new Error(response.data.msg || '上传文件失败')
    return response.data.data!
  }

  /** 删除文件（代理模式） */
  async deleteFile(data: OSSFileDeleteReq) {
    const response = await axClient.post<ApiResponse<void>>('/oss/delete', data)
    if (response.data.code !== 200) throw new Error(response.data.msg || '删除文件失败')
  }

  /** 获取文件URL（代理模式） */
  async getFileURL(data: OSSFileUrlReq) {
    const response = await axClient.post<ApiResponse<OSSFileUrlResp>>('/oss/get-url', data)
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取文件URL失败')
    return response.data.data!
  }
}

/** 导出单例实例 */
export const ossApi = new OSSApi()
