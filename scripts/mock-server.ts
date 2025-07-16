import { fakerZH_CN as faker } from '@faker-js/faker'
import cors from 'cors'
import express, { Express } from 'express'
import morgan from 'morgan'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

const app: Express = express()
const PORT = 3000

app.use(cors())
app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 视频状态权重配置
const videoStatusWeights = {
	InQueue: 0.3,
	InProgress: 0.3,
	Succeed: 0.35,
	Failed: 0.05,
}

// 权重随机选择
const weightedRandom = (weightConfig: Record<string, number>) => {
	const random = Math.random()
	let cumulative = 0
	for (const [key, weight] of Object.entries(weightConfig)) {
		cumulative += weight
		if (random < cumulative) return key
	}
	return Object.keys(weightConfig)[0]
}

const mockVideo = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
const mockImage = 'https://avatars.githubusercontent.com/u/124599?v=4'

const genResp = (prompt: string, model: string) => {
	const length = faker.number.int({ min: 1000, max: 3000 })
	const sentences = faker.lorem.sentences(faker.number.int({ min: 3, max: 15 }))
	return sentences.repeat(Math.ceil(length / sentences.length)).slice(0, length)
}

app.post('/v1/chat/completions', async (req, res) => {
	const { model, messages } = req.body
	const prompt = messages?.[0]?.content || ''
	const requestId = uuidv4()

	// 随机延迟，差异化
	const delayTime = faker.number.int({ min: 0, max: 200 })
	await delay(delayTime)

	const content = genResp(prompt, model)
	const response = {
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
				},
				finish_reason: 'stop',
			},
		],
		usage: {
			prompt_tokens: prompt.length,
			completion_tokens: content.length,
			total_tokens: prompt.length + content.length,
		},
	}
	res.json(response)
})

app.post('/v1/chat/completions-stream', async (req, res) => {
	const { model, messages } = req.body
	const prompt = messages?.[0]?.content || ''
	const requestId = uuidv4()
	console.log(`[Mock] Text generation stream request: ${prompt.slice(0, 50)}...`)

	res.setHeader('Content-Type', 'text/event-stream')
	res.setHeader('Cache-Control', 'no-cache')
	res.setHeader('Connection', 'keep-alive')

	// 生成完整回答内容
	const fullResponse = genResp(prompt, model)
	const chunks = fullResponse.split('')

	for (let i = 0; i < chunks.length; i++) {
		const chunk = {
			id: `chatcmpl-${requestId}`,
			object: 'chat.completion.chunk',
			created: Math.floor(Date.now() / 1000),
			model: model,
			choices: [
				{
					index: 0,
					delta: { content: chunks[i] },
					finish_reason: null,
				},
			],
		}
		res.write(`data: ${JSON.stringify(chunk)}\n\n`)

		const charDelay = faker.number.int({ min: 0, max: 100 })
		await delay(charDelay)
	}

	// 结束标记
	const endChunk = {
		id: `chatcmpl-${requestId}`,
		object: 'chat.completion.chunk',
		created: Math.floor(Date.now() / 1000),
		model: model,
		choices: [
			{
				index: 0,
				delta: {},
				finish_reason: 'stop',
			},
		],
	}
	res.write(`data: ${JSON.stringify(endChunk)}\n\n`)
	res.write('data: [DONE]\n\n')
	res.end()
})

app.post('/v1/images/generations', async (req, res) => {
	const { prompt, batch_size } = req.body
	const requestId = uuidv4()
	console.log(`[Mock] Image generation request: ${prompt.slice(0, 50)}...`)
	await delay(2000)
	const images: any[] = []
	for (let i = 0; i < (batch_size || 1); i++) {
		images.push({
			url: mockImage,
			revised_prompt: prompt,
		})
	}
	const response = {
		id: `img-${requestId}`,
		created: Math.floor(Date.now() / 1000),
		data: images,
		images: images,
		timings: { inference: 2.5 },
		seed: Math.floor(Math.random() * 1000000),
	}
	res.json(response)
})

app.post('/v1/video/submit', async (req, res) => {
	const { prompt } = req.body
	const requestId = uuidv4()
	console.log(`[Mock] Video generation task submit: ${prompt.slice(0, 50)}...`)
	await delay(500)
	res.json({
		requestId: requestId,
		status: 'submitted',
	})
})

app.post('/v1/video/status', async (req, res) => {
	const { requestId } = req.body
	console.log(`[Mock] Video status check: ${requestId}`)
	await delay(300)
	const status = weightedRandom(videoStatusWeights)
	let results
	if (status === 'Succeed') {
		results = {
			videos: [{ url: mockVideo }],
			timings: { inference: 15.5 },
			seed: Math.floor(Math.random() * 1000000),
		}
	} else if (status === 'Failed') {
		results = { reason: '模拟生成失败：资源不足' }
	}
	res.json({
		status: status,
		results: results,
		reason: status === 'Failed' ? results.reason : undefined,
	})
})

app.get('/health', (_, res) => {
	res.json({ status: 'ok', timestamp: dayjs().toISOString() })
})

app.listen(PORT, () => {
	console.log(`🚀 Mock AI Agent Server running on http://localhost:${PORT}`)
	console.log(`📝 Text API (Non-stream): POST http://localhost:${PORT}/v1/chat/completions`)
	console.log(`🌊 Text API (Stream): POST http://localhost:${PORT}/v1/chat/completions-stream`)
	console.log(`🖼️  Image API: POST http://localhost:${PORT}/v1/images/generations`)
	console.log(`🎬 Video Submit API: POST http://localhost:${PORT}/v1/video/submit`)
	console.log(`📊 Video Status API: POST http://localhost:${PORT}/v1/video/status`)
	console.log(`❤️  Health Check: GET http://localhost:${PORT}/health`)
})

process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
