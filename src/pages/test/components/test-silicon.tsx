import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { SuggestInput } from '@/components/common/suggest-input'

// Silicon Flow API 流式响应结构
interface SiliconFlowResponse {
	id: string // 响应ID
	object: string // 对象类型，如 "chat.completion.chunk"
	created: number // 创建时间戳
	model: string // 使用的模型名称
	choices: {
		index: number // 选项索引
		message?: {
			content: string // 完整消息内容（非流式）
			role?: string // 角色
		}
		delta?: {
			content?: string | null // 流式内容片段
			reasoning_content?: string // 推理内容
			role?: string // 角色
		}
		finish_reason?: string | null // 完成原因
	}[]
	system_fingerprint?: string // 系统指纹
	usage?: {
		prompt_tokens: number // 提示词 token 数
		completion_tokens: number // 完成 token 数
		total_tokens: number // 总 token 数
		completion_tokens_details?: {
			reasoning_tokens?: number // 推理 token 数
		}
	}
}

interface ImageGenerationResponse {
	images: Array<{
		url: string
	}>
	timings: {
		inference: number
	}
	seed: number
}

// 图片生成模型配置
const imagesModels = ['Kwai-Kolors/Kolors']

// 检查是否为图片生成模型
function isImageModel(model: string): boolean {
	return imagesModels.includes(model)
}

/**
 * Silicon Flow API 测试组件
 */
export const TestSilicon = () => {
	const [question, setQuestion] = useState('你好')
	const [token, setToken] = useState('')
	const [model, setModel] = useState('Pro/deepseek-ai/DeepSeek-R1')
	const [textResponse, setTextResponse] = useState<string>('')
	const [imageResponse, setImageResponse] = useState<ImageGenerationResponse | null>(null)
	const [streaming, setStreaming] = useState(true)

	// 重置响应状态
	const resetResponses = () => {
		setTextResponse('')
		setImageResponse(null)
	}

	// 根据模型判断是否为图片模式
	const isImageMode = isImageModel(model)

	// 模型选项
	const modelOptions = ['Kwai-Kolors/Kolors', 'Pro/deepseek-ai/DeepSeek-R1']

	// 从环境变量读取 API Key
	useEffect(() => {
		const apiKey = import.meta.env.VITE_SILICON_API_KEY
		if (apiKey) {
			setToken(apiKey)
		}
	}, [])

	const mutation = useMutation({
		mutationFn: async (data: { question: string; token: string; model: string; streaming: boolean }) => {
			// 根据模型判断是图片生成还是文本生成
			if (isImageModel(data.model)) {
				// 图片生成API
				const imageApi = 'https://api.siliconflow.cn/v1/images/generations'

				const imageResponse = await axios.post<ImageGenerationResponse>(
					imageApi,
					{
						model: data.model,
						prompt: data.question,
						image_size: '1024x1024',
						batch_size: 1,
						num_inference_steps: 20,
						guidance_scale: 7.5,
					},
					{
						headers: {
							Authorization: `Bearer ${data.token}`,
							'Content-Type': 'application/json',
						},
					}
				)

				return { type: 'image', data: imageResponse.data }
			} else {
				// 文本生成API
				const siliconApi = 'https://api.siliconflow.cn/v1/chat/completions'

				const requestData = {
					model: data.model,
					stream: data.streaming,
					messages: [
						{
							role: 'user',
							content: data.question,
						},
					],
				}

				if (data.streaming) {
					// 处理流式响应
					const response = await fetch(siliconApi, {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${data.token}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(requestData),
					})

					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`)
					}

					const reader = response.body?.getReader()
					const decoder = new TextDecoder()
					let result = ''

					if (reader) {
						while (true) {
							const { done, value } = await reader.read()
							if (done) break

							const chunk = decoder.decode(value)
							const lines = chunk.split('\n')

							for (const line of lines) {
								if (line.startsWith('data: ')) {
									const data = line.slice(6).trim()
									if (data === '[DONE]') continue

									try {
										const parsed = JSON.parse(data)
										const content = parsed.choices[0]?.delta?.content
										if (content) {
											result += content
											setTextResponse(result)
										}
									} catch (e) {
										// 忽略解析错误
									}
								}
							}
						}
					}

					return { type: 'text', data: { choices: [{ message: { content: result } }] } }
				} else {
					// 非流式响应
					const response = await axios.post<SiliconFlowResponse>(siliconApi, requestData, {
						headers: {
							Authorization: `Bearer ${data.token}`,
							'Content-Type': 'application/json',
						},
					})

					return { type: 'text', data: response.data }
				}
			}
		},
		onSuccess: (result: any) => {
			if (result.type === 'image') {
				setImageResponse(result.data)
				setTextResponse('') // 清空文本响应
			} else if (result.type === 'text') {
				if (!streaming) {
					setTextResponse(result.data.choices[0]?.message?.content || '未获取到响应内容')
				}
				setImageResponse(null) // 清空图片数据
			}
		},
		onError: (error) => {
			console.error('Silicon Flow API 调用失败:', error)
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

		resetResponses() // 重置响应状态
		mutation.mutate({ question, token, model, streaming: !isImageMode && streaming })
	}

	return (
		<div className="p-6 max-w-4xl mx-auto space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Silicon Flow API 测试</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<label htmlFor="token" className="block text-sm font-medium mb-2">
							API Token
						</label>
						<Input id="token" type="password" placeholder="输入您的 Silicon Flow API Token" value={token} onChange={(e) => setToken(e.target.value)} />
					</div>

					<div>
						<label htmlFor="model" className="block text-sm font-medium mb-2">
							模型
						</label>
						<SuggestInput
							placeholder="选择模型..."
							suggestions={modelOptions}
							value={model}
							onChange={(value) => setModel(value)}
							className="w-full"
						/>
					</div>

					<div>
						<label htmlFor="question" className="block text-sm font-medium mb-2">
							描述
						</label>
						<Textarea id="question" placeholder="输入您的描述..." value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} />
					</div>

					<div className="flex items-center space-x-2">
						<Switch id="streaming" checked={streaming} onCheckedChange={setStreaming} />
						<label htmlFor="streaming" className="text-sm font-medium">
							流式响应 (Streaming)
						</label>
					</div>

					<Button onClick={handleSubmit} disabled={mutation.isPending} className="w-full">
						{mutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								生成中...
							</>
						) : (
							'生成'
						)}
					</Button>
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
										<div className="text-sm text-muted-foreground">
											生成耗时: {imageResponse.timings.inference}ms | 种子: {imageResponse.seed}
										</div>
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
