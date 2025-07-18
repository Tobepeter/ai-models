import { Credentials } from 'ali-oss'

/** 通用API响应格式 */
export interface OssBaseResp<T> {
	code: number
	msg: string
	data?: T
}

/** 后端STS响应数据 - 直接返回 ali-oss Credentials */
export interface OssSTSRespData {
	credentials: Credentials
}

/** 上传结果 */
export interface OssUploadResult {
	url?: string // 可选，如果不需要预览，可以不返回
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

/** API模式上传响应数据 */
export interface OssApiUploadData {
	objectKey: string
	url: string
	size: number
	type: string
	uploadTime: string
}

/** API模式获取URL响应数据 */
export interface OssApiGetUrlData {
	url: string
	objectKey: string
}

/** OSS上传选项 */
export interface OssUploadOpt {
	prefix?: string
	fileName?: string
	noPreview?: boolean // 不需要预览URL，可以跳过获取URL步骤
	onProgress?: (percent: number) => void // 上传进度回调
}

/** 通用oss客户端配置 */
export interface OssClientConfig {
	accessKeyId: string
	accessKeySecret: string
}

export enum OssAccessType {
	Sts = 'sts', // 前端使用sts
	Api = 'api', // 后端直接使用api
	Pub = 'pub', // 前端直接使用公共客户端
	Ak = 'ak', // 前端直接使用ak
}
