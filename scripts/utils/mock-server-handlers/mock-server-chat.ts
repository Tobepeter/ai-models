import { Request, Response } from 'express'
import { fakerZH_CN as faker } from '@faker-js/faker'
import { v4 as uuidv4 } from 'uuid'
import type { ChatCompletion, ChatCompletionChunk } from 'openai/resources'
import { delay } from '../common'

/** 聊天对话处理 */
export const chatCompletionsHandler = async (req: Request, res: Response) => {
	const { model, messages, stream } = req.body
	const prompt = messages?.[0]?.content || ''
	const requestId = uuidv4()

	// 回答问题开始，随机延迟，差异化
	const delayTime = faker.number.int({ min: 0, max: 200 })
	await delay(delayTime)

	const genResp = (prompt: string, model: string) => {
		const len = faker.number.int({ min: 200, max: 300 })
		const sentences = faker.lorem.sentences(faker.number.int({ min: 3, max: 15 }))
		return sentences.repeat(Math.ceil(len / sentences.length)).slice(0, len)
	}

	if (stream) {
		// 流式响应
		console.log(`[Mock] Text generation stream request: ${prompt.slice(0, 50)}...`)

		res.setHeader('Content-Type', 'text/event-stream')
		res.setHeader('Cache-Control', 'no-cache')
		res.setHeader('Connection', 'keep-alive')

		// 生成完整回答内容
		const fullResponse = genResp(prompt, model)
		const chunks = fullResponse.split('')

		for (let i = 0; i < chunks.length; i++) {
			const chunk: ChatCompletionChunk = {
				id: `chatcmpl-${requestId}`,
				object: 'chat.completion.chunk',
				created: Math.floor(Date.now() / 1000),
				model: model,
				choices: [
					{
						index: 0,
						delta: { content: chunks[i] },
						finish_reason: null,
						logprobs: null,
					},
				],
			}
			res.write(`data: ${JSON.stringify(chunk)}\n\n`)

			const charDelay = faker.number.int({ min: 0, max: 20 })
			await delay(charDelay)
		}

		// 结束标记
		const endChunk: ChatCompletionChunk = {
			id: `chatcmpl-${requestId}`,
			object: 'chat.completion.chunk',
			created: Math.floor(Date.now() / 1000),
			model: model,
			choices: [
				{
					index: 0,
					delta: {},
					finish_reason: 'stop',
					logprobs: null,
				},
			],
		}
		res.write(`data: ${JSON.stringify(endChunk)}\n\n`)
		res.write('data: [DONE]\n\n')
		res.end()
	} else {
		// 非流式响应
		const content = genResp(prompt, model)
		const resp: ChatCompletion = {
			id: `chatcmpl-${requestId}`,
			object: 'chat.completion',
			created: Math.floor(Date.now() / 1000),
			model: model,
			choices: [
				{
					index: 0,
					message: {
						role: 'assistant',
						content: content,
						refusal: null,
					},
					finish_reason: 'stop',
					logprobs: null,
				},
			],
			usage: {
				prompt_tokens: prompt.length,
				completion_tokens: content.length,
				total_tokens: prompt.length + content.length,
			},
		}
		res.json(resp)
	}
}
