import { axiosClient } from '../axios-client'
import { 
  STSResponse, 
  SignRequest, 
  SignResponse, 
  HashifyNameRequest, 
  HashifyNameResponse,
  FileUploadResponse,
  FileDeleteRequest,
  FileUrlRequest,
  FileUrlResponse
} from '../types/api-types'
import { ApiResponse } from '../common'

/** OSS相关API类 */
class OSSApi {

  /** 获取STS临时凭证 */
  async getSTSCredentials() {
    const response = await axiosClient.post<ApiResponse<STSResponse>>('/oss/sts')
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取STS凭证失败')
    return response.data.data!
  }

  /** 获取上传签名 */
  async signToUpload(data: SignRequest) {
    const response = await axiosClient.post<ApiResponse<SignResponse>>('/oss/sign-to-upload', data)
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取上传签名失败')
    return response.data.data!
  }

  /** 获取下载签名 */
  async signToFetch(data: SignRequest) {
    const response = await axiosClient.post<ApiResponse<SignResponse>>('/oss/sign-to-fetch', data)
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取下载签名失败')
    return response.data.data!
  }

  /** 生成哈希文件名 */
  async hashifyName(data: HashifyNameRequest) {
    const response = await axiosClient.post<ApiResponse<HashifyNameResponse>>('/oss/hashify-name', data)
    if (response.data.code !== 200) throw new Error(response.data.msg || '生成哈希文件名失败')
    return response.data.data!
  }

  /** 获取文件列表 */
  async getFileList() {
    const response = await axiosClient.get<ApiResponse<string[]>>('/oss/files')
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

    const response = await axiosClient.post<ApiResponse<FileUploadResponse>>('/oss/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (response.data.code !== 200) throw new Error(response.data.msg || '上传文件失败')
    return response.data.data!
  }

  /** 删除文件（代理模式） */
  async deleteFile(data: FileDeleteRequest) {
    const response = await axiosClient.post<ApiResponse<void>>('/oss/delete', data)
    if (response.data.code !== 200) throw new Error(response.data.msg || '删除文件失败')
  }

  /** 获取文件URL（代理模式） */
  async getFileURL(data: FileUrlRequest) {
    const response = await axiosClient.post<ApiResponse<FileUrlResponse>>('/oss/get-url', data)
    if (response.data.code !== 200) throw new Error(response.data.msg || '获取文件URL失败')
    return response.data.data!
  }
}

/** 导出单例实例 */
export const ossApi = new OSSApi()
