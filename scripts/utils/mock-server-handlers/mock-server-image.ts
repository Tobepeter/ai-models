import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import type { ImagesResponse } from 'openai/resources'
import { delay } from '../common'
import { MOCK_IMAGE } from './types'

/** 图片生成处理 */
export const imageGenerationsHandler = async (req: Request, res: Response) => {
	const { prompt, n = 1, size = '1024x1024', quality = 'standard', model = 'dall-e-3' } = req.body
	const requestId = uuidv4()
	console.log(`[Mock] Image generation request: ${prompt.slice(0, 50)}... (model: ${model}, size: ${size})`)
	await delay(2000)
	
	const images: Array<{ url: string; revised_prompt?: string }> = []
	for (let i = 0; i < n; i++) {
		images.push({
			url: MOCK_IMAGE,
			revised_prompt: model === 'dall-e-3' ? prompt : undefined,
		})
	}
	
	const resp: ImagesResponse = {
		created: Math.floor(Date.now() / 1000),
		data: images,
	}
	res.json(resp)
}
