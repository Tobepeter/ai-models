import cors from 'cors'
import express, { Express } from 'express'
import morgan from 'morgan'
import { chatCompletionsHandler } from './utils/mock-server-handlers/mock-server-chat'
import { imageGenerationsHandler } from './utils/mock-server-handlers/mock-server-image'
import { videoStatusHandler, videoSubmitHandler } from './utils/mock-server-handlers/mock-server-video'

const app: Express = express()
const PORT = 3000

app.use(cors())
app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.post('/v1/chat/completions', chatCompletionsHandler)
app.post('/v1/images/generations', imageGenerationsHandler)
app.post('/v1/video/submit', videoSubmitHandler)
app.post('/v1/video/status', videoStatusHandler)

app.listen(PORT, () => {
	console.log(`🚀 Mock AI Agent Server running on http://localhost:${PORT}`)
})
