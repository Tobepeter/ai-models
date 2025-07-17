/** 通用API响应格式 */
export interface OssBaseResp<T> {
	code: number
	msg: string
	data?: T
}

/** 后端STS响应数据 - 直接返回 ali-oss Credentials */
export interface OssSTSRespData {
	AccessKeyId: string
	AccessKeySecret: string
	SecurityToken: string
	Expiration: string
}

/** 上传结果 */
export interface OssUploadResult {
	url: string
	objectKey: string
	hashifyName: string
	size: number
	type: string
	uploadTime: string
}

/** 签名上传响应数据 */
export interface OssSignToUploadData {
	signedUrl: string
	objectKey: string
}

/** 签名获取响应数据 */
export interface SignToFetchData {
	signedUrl: string
	objectKey: string
}

/** 生成哈希化响应数据 */
export interface OssHashifyNameData {
	hashifyName: string
}

/** 通用oss客户端配置 */
export interface OssClientConfig {
	accessKeyId: string
	accessKeySecret: string
	bucket: string
	region: string
}

export enum OssAccessType {
	Sts = 'sts', // 前端使用sts
	Api = 'api', // 后端直接使用api
	Pub = 'pub', // 前端直接使用公共客户端
	Ak = 'ak', // 前端直接使用ak
}
