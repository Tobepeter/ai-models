import { requestConfig } from '@/config/request-config'
import { axClient } from '../ax-client'
import { ApiResp } from '../common'
import { AIChatCompletionReq, AIChatCompletionResp, AIImageGenReq, AIImageGenResp } from '../types/api-types'
import OpenAI from 'openai'

class AIApi {
	// 聊天
	async chat(data: AIChatCompletionReq) {
		const res = await axClient.post<ApiResp<AIChatCompletionResp>>('/ai/v1/chat/completions', data)
		if (res.data.code !== 200) throw new Error(res.data.msg || '聊天完成失败')
		return res.data.data!
	}

	// 图片生成
	async genImages(data: AIImageGenReq) {
		const res = await axClient.post<ApiResp<AIImageGenResp>>('/ai/v1/images/generations', data)
		if (res.data.code !== 200) throw new Error(res.data.msg || '图片生成失败')
		return res.data.data!
	}

	// 流式聊天 - 使用 OpenAI SDK
	async streamChat(data: AIChatCompletionReq, onChunk: (chunk: string) => void) {
		try {
			const tk = axClient.getToken()
			if (!tk) throw new Error('未登录')

			const cli = new OpenAI({
				baseURL: `${requestConfig.serverUrl}/ai/v1`,
				apiKey: tk || 'dummy-key',
				timeout: requestConfig.chatTimeout || 30000,
				dangerouslyAllowBrowser: true,
			})

			const stream = await cli.chat.completions.create({
				model: data.model,
				messages: data.messages,
				temperature: data.temperature,
				max_tokens: data.max_tokens,
				stream: true,
			})

			for await (const ch of stream) {
				const c = ch.choices[0]?.delta?.content || ''
				if (c) {
					onChunk(c)
				}
			}
		} catch (err) {
			console.error('[AIApi] streamChat error', err)
			throw err
		}
	}
}

export const aiApi = new AIApi()
