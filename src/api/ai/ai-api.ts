import { axiosClient } from '../axios-client'
import { 
  TextGenerationRequest, 
  ImageGenerationRequest, 
  ImageGenerationResponse,
  ChatCompletionRequest,
  ChatCompletionResponse
} from '../types/api-types'
import { ApiResponse } from '../common'

/** AI相关API类 */
class AIApi {

  /** 聊天完成 */
  async chatCompletion(data: ChatCompletionRequest) {
    const response = await axiosClient.post<ApiResponse<ChatCompletionResponse>>('/ai/v1/chat/completions', data)
    if (response.data.code !== 200) throw new Error(response.data.msg || '聊天完成失败')
    return response.data.data!
  }

  /** 图片生成 */
  async generateImages(data: ImageGenerationRequest) {
    const response = await axiosClient.post<ApiResponse<ImageGenerationResponse>>('/ai/v1/images/generations', data)
    if (response.data.code !== 200) throw new Error(response.data.msg || '图片生成失败')
    return response.data.data!
  }

  /** 流式聊天完成 */
  async streamChatCompletion(data: ChatCompletionRequest, onChunk: (chunk: string) => void) {
    const streamData = { ...data, stream: true }

    const response = await fetch(`http://localhost:8080/ai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(streamData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法获取响应流')
    }

    const decoder = new TextDecoder()
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              return
            }
            
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                onChunk(content)
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}

/** 导出单例实例 */
export const aiApi = new AIApi()
