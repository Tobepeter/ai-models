import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import type { ImagesResponse } from 'openai/resources'
import { delay } from '../common'
import { MOCK_IMAGE } from './types'

/** 图片生成处理 */
export const imageGenerationsHandler = async (req: Request, res: Response) => {
	const { prompt, batch_size } = req.body
	const requestId = uuidv4()
	console.log(`[Mock] Image generation request: ${prompt.slice(0, 50)}...`)
	await delay(2000)
	
	const images: Array<{ url: string; revised_prompt: string }> = []
	for (let i = 0; i < (batch_size || 1); i++) {
		images.push({
			url: MOCK_IMAGE,
			revised_prompt: prompt,
		})
	}
	
	const resp: ImagesResponse = {
		created: Math.floor(Date.now() / 1000),
		data: images,
	}
	res.json(resp)
}
