import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ImagePreview } from '@/components/common/image-preview'
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
	const [videoResponse, setVideoResponse] = useState<string>('')
	const [negativePrompt, setNegativePrompt] = useState('')
	const [imageUrl, setImageUrl] = useState<string>('')
	const [streaming, setStreaming] = useState(true)
	const [platform, setPlatform] = useState<AIPlatform>(AIPlatform.Silicon)

	// 平台选项
	const platformOptions = Object.values(AIPlatform).map((val) => ({
		value: val,
		label: val,
	}))

	const modelConfig = aiAgentMgr.agent?.modelConfig || {
		text: [],
		image: [],
		video: [],
	}
	const isImageModel = (model: string) => modelConfig.image.includes(model)
	const isVideoModel = (model: string) => modelConfig.video?.includes(model) || false
	const allModels = [...modelConfig.text, ...modelConfig.image, ...(modelConfig.video || [])]
	const modelOptions = allModels.map((model) => {
		let suffix = '💬 '
		if (isImageModel(model)) {
			suffix = '🖼️ '
		} else if (isVideoModel(model)) {
			suffix = '🎥 '
		}
		return {
			value: model,
			label: `${model} ${suffix}`,
		}
	})

	// 根据模型判断是否为图片模式
	const isImageMode = isImageModel(model)
	const isVideoMode = isVideoModel(model)

	const reset = () => {
		setTextResponse('')
		setImageResponse(null)
		setVideoResponse('')
	}

	// 从环境变量读取 API Key
	useMount(() => {
		setToken(import.meta.env.VITE_SILICON_API_KEY)
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

	// 视频生成处理
	const handleVideoGeneration = async () => {
		const options = {
			image_size: '1280x720',
			negative_prompt: negativePrompt.trim() || undefined,
			image: imageUrl.trim() || undefined,
		}
		const result = await aiAgentMgr.generateVideo(question, options)
		setVideoResponse(result)
		return result
	}

	const mutation = useMutation({
		mutationFn: async () => {
			if (!token.trim()) {
				throw new Error('AI Agent未配置，请检查API Token')
			}

			if (isImageMode) {
				return await handleImageGeneration()
			} else if (isVideoMode) {
				return await handleVideoGeneration()
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
			setVideoResponse('')
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

		reset()
		mutation.mutate()
	}

	// 获取输入标签文字
	const getInputLabel = () => {
		if (isImageMode) return '图片描述'
		if (isVideoMode) return '视频描述'
		return '问题/描述'
	}

	// 获取输入占位符
	const getInputPlaceholder = () => {
		if (isImageMode) return '请描述你想要生成的图片...'
		if (isVideoMode) return '请描述你想要生成的视频...'
		return '请输入你的问题...'
	}

	const { isPending } = mutation

	// 获取按钮文字
	const getButtonText = () => {
		if (isPending) {
			if (isImageMode) return '生成图片中...'
			if (isVideoMode) return '生成视频中...'
			return '生成文本中...'
		}
		if (isImageMode) return '生成图片'
		if (isVideoMode) return '生成视频'
		return '生成文本'
	}

	return (
		<div className="p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<span>AI Agent 测试</span>
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
							{getInputLabel()}
						</label>
						<Textarea id="question" placeholder={getInputPlaceholder()} value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} />
					</div>

					{isVideoMode && (
						<>
							<div>
								<label htmlFor="negativePrompt" className="block text-sm font-medium mb-2">
									反向提示词 (可选)
								</label>
								<Input id="negativePrompt" placeholder="输入不想要的内容，如：模糊、低质量" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} />
							</div>
							<div>
								<label className="block text-sm font-medium mb-2">参考图片 (可选)</label>
								<ImagePreview url={imageUrl} base64Mode onChange={setImageUrl} size={120} className="border-2 border-dashed" />
							</div>
						</>
					)}

					{!isImageMode && !isVideoMode && (
						<div className="flex items-center space-x-2">
							<Switch id="streaming" checked={streaming} onCheckedChange={setStreaming} />
							<label htmlFor="streaming" className="text-sm font-medium">
								流式响应 (Streaming)
							</label>
						</div>
					)}

					<div className="flex space-x-2">
						<Button onClick={handleSubmit} disabled={mutation.isPending} className="flex-1">
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{getButtonText()}
								</>
							) : (
								getButtonText()
							)}
						</Button>
					</div>
				</CardContent>
			</Card>

			{(textResponse || imageResponse || videoResponse) && (
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
						{videoResponse && (
							<div className="space-y-4">
								<div className="space-y-2">
									<video src={videoResponse} controls className="w-full h-auto rounded-md border" />
									<div className="text-sm text-muted-foreground">视频生成完成</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	)
}
