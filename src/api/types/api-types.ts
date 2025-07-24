/** OSS相关类型 */

/** STS临时凭证 */
export interface OSSSTSCredentials {
  AccessKeyId: string
  AccessKeySecret: string
  SecurityToken: string
  Expiration: string
}

/** STS响应 */
export interface OSSSTSResp {
  credentials: OSSSTSCredentials
}

/** 签名请求 */
export interface OSSSignReq {
  objectKey: string
  fileType?: string
}

/** 签名响应 */
export interface OSSSignResp {
  signedUrl: string
  objectKey: string
}

/** 哈希文件名请求 */
export interface OSSHashifyNameReq {
  fileName: string
}

/** 哈希文件名响应 */
export interface OSSHashifyNameResp {
  hashedName: string
}

/** 文件上传响应 */
export interface OSSFileUploadResp {
  url: string
  objectKey: string
  size: number
}

/** 文件删除请求 */
export interface OSSFileDeleteReq {
  objectKey: string
}

/** 文件URL获取请求 */
export interface OSSFileUrlReq {
  objectKey: string
  expires?: number
}

/** 文件URL响应 */
export interface OSSFileUrlResp {
  url: string
  expires: string
}

/** AI相关类型 */

/** 文本生成请求 */
export interface AITextGenReq {
  prompt: string
  model: string
  maxTokens?: number
  temperature?: number
  stream?: boolean
}

/** 图片生成请求 */
export interface AIImageGenReq {
  prompt: string
  model: string
  size?: string
  quality?: string
  n?: number
}

/** 图片生成响应 */
export interface AIImageGenResp {
  images: Array<{
    url: string
    revised_prompt?: string
  }>
}

/** 聊天完成请求 */
export interface AIChatCompletionReq {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

/** 聊天完成响应 */
export interface AIChatCompletionResp {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}