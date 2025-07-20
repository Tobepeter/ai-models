import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import weighted from 'weighted'
import { delay } from '../common'
import {
	VideoSubmitResp,
	VideoStatusResp,
	VideoStatus,
	MOCK_VIDEO
} from './types'

const statusWeight: Record<VideoStatus, number> = {
	InQueue: 0.3,
	InProgress: 0.3,
	Succeed: 0.35,
	Failed: 0.05,
}

/** 视频生成任务提交 */
export const videoSubmitHandler = async (req: Request, res: Response) => {
	const { prompt } = req.body
	const requestId = uuidv4()
	console.log(`[Mock] Video generation task submit: ${prompt.slice(0, 50)}...`)
	await delay(500)

	const resp: VideoSubmitResp = {
		requestId: requestId,
		status: 'submitted',
	}
	res.json(resp)
}

/** 视频生成状态查询 */
export const videoStatusHandler = async (req: Request, res: Response) => {
	const { requestId } = req.body
	console.log(`[Mock] Video status check: ${requestId}`)
	await delay(300)

	const statuses = Object.keys(statusWeight) as VideoStatus[]
	const weights = Object.values(statusWeight)
	const status = weighted.select(statuses, weights) as VideoStatus

	let results: VideoStatusResp['results']
	let reason: string | undefined

	if (status === 'Succeed') {
		results = {
			videos: [{ url: MOCK_VIDEO }],
			timings: { inference: 15.5 },
			seed: Math.floor(Math.random() * 1000000),
		}
	} else if (status === 'Failed') {
		reason = '模拟生成失败：资源不足'
	}

	const resp: VideoStatusResp = {
		status: status,
		results: results,
		reason: reason,
	}
	res.json(resp)
}
