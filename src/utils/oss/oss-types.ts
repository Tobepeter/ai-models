/** 通用API响应格式 */
export interface BaseResponse<T> {
	code: number
	msg: string
	data?: T
}

/** STS凭证信息 */
export interface STSCredentials {
	accessKeyId: string // 访问密钥ID
	accessKeySecret: string // 访问密钥
	securityToken: string // 安全令牌
	expiration: string // 过期时间
	region: string // 区域
	bucket: string // 存储桶
	endpoint: string // 终端节点
}

/** 后端STS响应数据 */
export interface STSResponseData {
	accessKeyId: string
	accessKeySecret: string
	stsToken: string
	expiration: string
}

/** STS响应 */
export interface STSResponse extends BaseResponse<STSResponseData> {}

/** 删除文件响应 */
export interface DeleteResponse extends BaseResponse<void> {}

/** 上传结果 */
export interface UploadResult {
	url: string
	objectKey: string
	size: number
	type: string
	uploadTime: string
}
