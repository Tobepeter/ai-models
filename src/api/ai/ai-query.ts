import { useMutation } from '@tanstack/react-query'
import { aiApi } from './ai-api'
import { ChatCompletionRequest, ImageGenerationRequest } from '../types/api-types'

/** AI相关React Query hooks */

/** 聊天完成 */
export const useChatCompletion = () => {
  return useMutation({
    mutationFn: aiApi.chatCompletion,
    onError: (error) => {
      console.error('聊天完成失败:', error)
    },
  })
}

/** 图片生成 */
export const useImageGeneration = () => {
  return useMutation({
    mutationFn: aiApi.generateImages,
    onError: (error) => {
      console.error('图片生成失败:', error)
    },
  })
}

/** 流式聊天完成 */
export const useStreamChatCompletion = () => {
  return useMutation({
    mutationFn: ({ data, onChunk }: { data: ChatCompletionRequest; onChunk: (chunk: string) => void }) =>
      aiApi.streamChatCompletion(data, onChunk),
    onError: (error) => {
      console.error('流式聊天完成失败:', error)
    },
  })
}
