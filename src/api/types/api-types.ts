/** OSS相关类型 */

/** STS临时凭证 */
export interface STSCredentials {
  AccessKeyId: string
  AccessKeySecret: string
  SecurityToken: string
  Expiration: string
}

/** STS响应 */
export interface STSResponse {
  credentials: STSCredentials
}

/** 签名请求 */
export interface SignRequest {
  objectKey: string
  fileType?: string
}

/** 签名响应 */
export interface SignResponse {
  signedUrl: string
  objectKey: string
}

/** 哈希文件名请求 */
export interface HashifyNameRequest {
  fileName: string
}

/** 哈希文件名响应 */
export interface HashifyNameResponse {
  hashedName: string
}

/** 文件上传响应 */
export interface FileUploadResponse {
  url: string
  objectKey: string
  size: number
}

/** 文件删除请求 */
export interface FileDeleteRequest {
  objectKey: string
}

/** 文件URL获取请求 */
export interface FileUrlRequest {
  objectKey: string
  expires?: number
}

/** 文件URL响应 */
export interface FileUrlResponse {
  url: string
  expires: string
}

/** AI相关类型 */

/** 文本生成请求 */
export interface TextGenerationRequest {
  prompt: string
  model: string
  maxTokens?: number
  temperature?: number
  stream?: boolean
}

/** 图片生成请求 */
export interface ImageGenerationRequest {
  prompt: string
  model: string
  size?: string
  quality?: string
  n?: number
}

/** 图片生成响应 */
export interface ImageGenerationResponse {
  images: Array<{
    url: string
    revised_prompt?: string
  }>
}

/** 聊天完成请求 */
export interface ChatCompletionRequest {
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
export interface ChatCompletionResponse {
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