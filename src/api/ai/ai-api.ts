import { requestConfig } from '@/config/request-config'
import { useUserStore } from '@/store/user-store'
import OpenAI from 'openai'

class AIApi {
	/** 流式聊天 - 使用 OpenAI SDK */
	// async streamChat(data: AIChatCompletionReq, onChunk: (chunk: string) => void) {
	// 	try {
	// 		const { token } = useUserStore.getState()
	// 		if (!token) throw new Error('未登录')
	// 		const cli = new OpenAI({
	// 			baseURL: `${requestConfig.serverUrl}/ai/v1`,
	// 			apiKey: token || 'dummy-key',
	// 			timeout: requestConfig.chatTimeout || 30000,
	// 			dangerouslyAllowBrowser: true,
	// 		})
	// 		const stream = await cli.chat.completions.create({
	// 			model: data.model,
	// 			messages: data.messages,
	// 			temperature: data.temperature,
	// 			max_tokens: data.max_tokens,
	// 			stream: true,
	// 		})
	// 		for await (const ch of stream) {
	// 			const c = ch.choices[0]?.delta?.content || ''
	// 			if (c) {
	// 				onChunk(c)
	// 			}
	// 		}
	// 	} catch (err) {
	// 		console.error('[AIApi] streamChat error', err)
	// 		throw err
	// 	}
	// }
}

export const aiApi = new AIApi()
