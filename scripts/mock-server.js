import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const formatTime = () => dayjs().format('[HH:mm]')

// 视频状态权重配置
const videoStatusWeights = {
	InQueue: 0.3,
	InProgress: 0.3,
	Succeed: 0.35,
	Failed: 0.05,
}

// 权重随机选择
const weightedRandom = (weightConfig) => {
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

app.post('/v1/chat/completions', async (req, res) => {
	const { model, messages } = req.body
	const prompt = messages?.[0]?.content || ''
	const requestId = uuidv4()
	console.log(`[Mock] Text generation request: ${prompt.slice(0, 50)}...`)
	await delay(1000)
	const timeStamp = formatTime()
	const response = {
		id: `chatcmpl-${requestId}`,
		object: 'chat.completion',
		created: Math.floor(Date.now() / 1000),
		model: model,
		choices: [{
			index: 0,
			message: {
				role: 'assistant',
				content: `${timeStamp} 这是对"${prompt}"的模拟回复。Mock Agent 已为您生成完整内容。`,
			},
			finish_reason: 'stop',
		}],
		usage: {
			prompt_tokens: prompt.length,
			completion_tokens: 50,
			total_tokens: prompt.length + 50,
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
	const timeStamp = formatTime()
	const mockResponse = `${timeStamp} 这是对"${prompt}"的模拟流式回复。Mock Agent 正在为您生成内容...`
	const chunks = mockResponse.split('')
	for (let i = 0; i < chunks.length; i++) {
		const chunk = {
			id: `chatcmpl-${requestId}`,
			object: 'chat.completion.chunk',
			created: Math.floor(Date.now() / 1000),
			model: model,
			choices: [{
				index: 0,
				delta: { content: chunks[i] },
				finish_reason: null,
			}],
		}
		res.write(`data: ${JSON.stringify(chunk)}\n\n`)
		await delay(50)
	}
	const endChunk = {
		id: `chatcmpl-${requestId}`,
		object: 'chat.completion.chunk',
		created: Math.floor(Date.now() / 1000),
		model: model,
		choices: [{
			index: 0,
			delta: {},
			finish_reason: 'stop',
		}],
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
	const images = []
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
