import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { AIPlatform, ImageResponse } from '@/utils/ai-agent/types'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { aiAgentMgr } from '@/utils/ai-agent/ai-agent-mgr'
import { useMount } from 'ahooks'

/**
 * AI Agent 测试组件
 */
export const TestAIAgent = () => {
	const [question, setQuestion] = useState('你好，请介绍一下自己')
	const [token, setToken] = useState('')
	const [model, setModel] = useState('Pro/deepseek-ai/DeepSeek-R1')
	const [textResponse, setTextResponse] = useState<string>('')
	const [imageResponse, setImageResponse] = useState<ImageResponse | null>(null)
	const [streaming, setStreaming] = useState(true)
	const [isRunning, setIsRunning] = useState<boolean>(false)
	const [platform, setPlatform] = useState<AIPlatform>(AIPlatform.Silicon)

	// 平台选项
	const platformOptions = Object.values(AIPlatform).map((val) => ({
		value: val,
		label: val,
	}))

	const modelConfig = aiAgentMgr.agent?.modelConfig || {
		text: [],
		image: [],
	}

	const allModels = [...modelConfig.text, ...modelConfig.image]
	const modelOptions = allModels.map((model) => ({
		value: model,
		label: model,
	}))

	// 检查是否为图片模型 - 从 agent 配置中读取
	const isImageModel = (model: string): boolean => {
		return modelConfig.image.includes(model)
	}

	// 根据模型判断是否为图片模式
	const isImageMode = isImageModel(model)

	// 重置响应状态
	const resetResponses = () => {
		setTextResponse('')
		setImageResponse(null)
	}

	// 从环境变量读取 API Key
	useMount(() => {
		const apiKey = import.meta.env.VITE_SILICON_API_KEY
		if (apiKey) {
			setToken(apiKey)
		}
	})

	// 监听平台变化
	useEffect(() => {
		aiAgentMgr.switchPlatform(platform)
	}, [platform])

	useEffect(() => {
		aiAgentMgr.setConfig({
			apiKey: token,
			model: model,
		})
	}, [token, model])

	// 监听AI Agent状态变化
	useEffect(() => {
		const checkState = () => {
			setIsRunning(aiAgentMgr.isRunning)
		}

		const interval = setInterval(checkState, 100)
		return () => clearInterval(interval)
	}, [])

	// 文本生成处理
	const handleTextGeneration = async (streaming: boolean) => {
		if (streaming) {
			// 流式生成
			let fullResponse = ''
			const result = await aiAgentMgr.generateTextStream(question, (chunk: string) => {
				fullResponse += chunk
				setTextResponse(fullResponse)
			})
			return result
		} else {
			// 非流式生成
			const result = await aiAgentMgr.generateText(question)
			setTextResponse(result)
			return result
		}
	}

	// 图片生成处理
	const handleImageGeneration = async () => {
		const result = await aiAgentMgr.generateImage(question)
		// 由于接口返回 string，需要解析为 images 数组
		try {
			const images = Array.isArray(result) ? result : JSON.parse(result)
			setImageResponse({ images })
		} catch {
			// 如果解析失败，假设是单个 URL
			setImageResponse({ images: [{ url: result }] })
		}
		return result
	}

	const mutation = useMutation({
		mutationFn: async () => {
			if (!token.trim()) {
				throw new Error('AI Agent未配置，请检查API Token')
			}

			if (isImageMode) {
				return await handleImageGeneration()
			} else {
				return await handleTextGeneration(streaming)
			}
		},
		onSuccess: (result) => {
			// console.log('Generation successful:', result)
		},
		onError: (error) => {
			console.error('Generation failed:', error)
			setTextResponse(`错误: ${error instanceof Error ? error.message : '未知错误'}`)
			setImageResponse(null)
		},
	})

	const handleSubmit = () => {
		if (!token.trim()) {
			setTextResponse('错误: 请输入 API Token')
			return
		}

		if (!question.trim()) {
			setTextResponse('错误: 请输入描述')
			return
		}

		resetResponses()
		mutation.mutate()
	}

	return (
		<div className="p-6 max-w-4xl mx-auto space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<span>AI Agent 测试</span>
						<Badge className={`${isRunning ? 'bg-blue-500' : 'bg-gray-500'} text-white`}>{isRunning ? '运行中' : '空闲'}</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<label htmlFor="token" className="block text-sm font-medium mb-2">
							API Token
						</label>
						<Input id="token" type="password" placeholder="输入您的 API Token" value={token} onChange={(e) => setToken(e.target.value)} />
					</div>

					<div>
						<label htmlFor="platform" className="block text-sm font-medium mb-2">
							平台
						</label>
						<Combobox options={platformOptions} value={platform} onValueChange={(value) => setPlatform(value as AIPlatform)} placeholder="选择平台..." className="w-full" />
					</div>

					<div>
						<label htmlFor="model" className="block text-sm font-medium mb-2">
							模型
						</label>
						<Combobox options={modelOptions} value={model} onValueChange={(value) => setModel(value)} placeholder="选择模型..." className="w-full" />
					</div>

					<div>
						<label htmlFor="question" className="block text-sm font-medium mb-2">
							{isImageMode ? '图片描述' : '问题/描述'}
						</label>
						<Textarea id="question" placeholder={isImageMode ? '请描述你想要生成的图片...' : '请输入你的问题...'} value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} />
					</div>

					{!isImageMode && (
						<div className="flex items-center space-x-2">
							<Switch id="streaming" checked={streaming} onCheckedChange={setStreaming} />
							<label htmlFor="streaming" className="text-sm font-medium">
								流式响应 (Streaming)
							</label>
						</div>
					)}

					<div className="flex space-x-2">
						<Button onClick={handleSubmit} disabled={mutation.isPending || isRunning} className="flex-1">
							{mutation.isPending || isRunning ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{isImageMode ? '生成图片中...' : '生成文本中...'}
								</>
							) : isImageMode ? (
								'生成图片'
							) : (
								'生成文本'
							)}
						</Button>
					</div>
				</CardContent>
			</Card>

			{(textResponse || imageResponse) && (
				<Card>
					<CardHeader>
						<CardTitle>响应结果</CardTitle>
					</CardHeader>
					<CardContent>
						{textResponse && (
							<div className="bg-gray-50 p-4 rounded-lg">
								<pre className="whitespace-pre-wrap text-sm">{textResponse}</pre>
							</div>
						)}
						{imageResponse && (
							<div className="space-y-4">
								{imageResponse.images.map((image, index) => (
									<div key={index} className="space-y-2">
										<img src={image.url} alt={`Generated image ${index + 1}`} className="w-full h-auto rounded-md border" loading="lazy" />
										<div className="text-sm text-muted-foreground">图片生成完成</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	)
}
