import { ImagePreview } from '@/components/common/image-preview'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { aiAgentMgr } from '@/utils/ai-agent/ai-agent-mgr'
import { mockModelConfig } from '@/utils/ai-agent/mock-agent'
import { AIPlatform } from '@/utils/ai-agent/types'
import { useMutation } from '@tanstack/react-query'
import { useMount } from 'ahooks'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

/**
 * Mock Agent 测试组件
 */
export const TestMockAgent = () => {
	const [question, setQuestion] = useState('你好，请介绍一下Mock Agent')
	const [model, setModel] = useState('mock-text-model-1')
	const [textResp, setTextResp] = useState('')
	const [imageResp, setImageResp] = useState('')
	const [videoResp, setVideoResp] = useState('')
	const [streaming, setStreaming] = useState(true)

	const modelConfig = mockModelConfig
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
		setTextResp('')
		setImageResp('')
		setVideoResp('')
	}

	// 初始化 Mock 平台
	useMount(() => {
		aiAgentMgr.switchPlatform(AIPlatform.Mock)
	})

	useEffect(() => {
		aiAgentMgr.setConfig({
			apiKey: 'mock-token', // Mock 不需要真实 token
			model: model,
		})
	}, [model])

	// 文本生成处理
	const handleTextGen = async (streaming: boolean) => {
		if (streaming) {
			// 流式生成
			let fullResponse = ''
			const result = await aiAgentMgr.generateTextStream(question, (chunk: string) => {
				fullResponse += chunk
				setTextResp(fullResponse)
			})
			return result
		} else {
			// 非流式生成
			const result = await aiAgentMgr.generateText(question)
			setTextResp(result)
			return result
		}
	}

	// 图片生成处理
	const handleImgGen = async () => {
		const imageUrls = await aiAgentMgr.generateImages(question)
		if (imageUrls && imageUrls.length > 0) {
			setImageResp(imageUrls[0])
			return imageUrls
		}
		throw new Error('图片生成失败')
	}

	// 视频生成处理
	const handleVideoGen = async () => {
		const videoUrls = await aiAgentMgr.generateVideos(question)
		if (videoUrls && videoUrls.length > 0) {
			setVideoResp(videoUrls[0])
			return videoUrls
		}
		throw new Error('视频生成失败')
	}

	const mutation = useMutation({
		mutationFn: async () => {
			if (isImageMode) {
				return await handleImgGen()
			} else if (isVideoMode) {
				return await handleVideoGen()
			} else {
				return await handleTextGen(streaming)
			}
		},
		onSuccess: (result) => {
			// console.log('Mock generation successful:', result)
		},
		onError: (error) => {
			console.error('Mock generation failed:', error)
			setTextResp(`错误: ${error instanceof Error ? error.message : '未知错误'}`)
			setImageResp('')
			setVideoResp('')
		},
	})

	const handleSubmit = () => {
		if (!question.trim()) {
			setTextResp('错误: 请输入描述')
			return
		}

		reset()
		mutation.mutate()
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						🎭 Mock Agent 测试
						<Badge variant="secondary">本地开发</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* 模型选择 */}
					<div className="space-y-2">
						<label className="text-sm font-medium">模型选择</label>
						<Combobox options={modelOptions} value={model} onValueChange={setModel} placeholder="选择模型..." className="min-w-[300px]" />
					</div>

					{/* 输入框 */}
					<div className="space-y-2">
						<label className="text-sm font-medium">{isImageMode ? '图片描述' : isVideoMode ? '视频描述' : '问题'}</label>
						<Textarea
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
							placeholder={isImageMode ? '请描述您想要生成的图片...' : isVideoMode ? '请描述您想要生成的视频...' : '请输入您的问题...'}
							rows={3}
						/>
					</div>

					{/* 流式开关 (仅文本模式) */}
					{!isImageMode && !isVideoMode && (
						<div className="flex items-center space-x-2">
							<Switch checked={streaming} onCheckedChange={setStreaming} />
							<label className="text-sm">流式响应</label>
						</div>
					)}

					{/* 提交按钮 */}
					<Button onClick={handleSubmit} disabled={mutation.isPending} className="w-full">
						{mutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{isImageMode ? '生成图片中...' : isVideoMode ? '生成视频中...' : '生成中...'}
							</>
						) : (
							<>{isImageMode ? '生成图片' : isVideoMode ? '生成视频' : '发送'}</>
						)}
					</Button>
				</CardContent>
			</Card>

			{/* 响应显示 */}
			{(textResp || imageResp || videoResp) && (
				<Card>
					<CardHeader>
						<CardTitle>响应结果</CardTitle>
					</CardHeader>
					<CardContent>
						{/* 文本响应 */}
						{textResp && (
							<div className="space-y-2">
								<label className="text-sm font-medium">文本响应</label>
								<div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">{textResp}</div>
							</div>
						)}

						{/* 图片响应 */}
						{imageResp && (
							<div className="space-y-2">
								<label className="text-sm font-medium">生成的图片</label>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<ImagePreview url={imageResp} notEditable />
								</div>
							</div>
						)}

						{/* 视频响应 */}
						{videoResp && (
							<div className="space-y-2">
								<label className="text-sm font-medium">生成的视频</label>
								<video controls className="w-full max-w-md rounded-lg">
									<source src={videoResp} type="video/mp4" />
									您的浏览器不支持视频播放。
								</video>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* 说明 */}
			<Card>
				<CardHeader>
					<CardTitle>Mock Agent 说明</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-muted-foreground">
					<p>• Mock Agent 是用于本地开发测试的模拟 AI 平台</p>
					<p>• 运行在 http://localhost:3000，需要先启动 mock server</p>
					<p>• 支持文本、图片、视频生成的模拟响应</p>
					<p>• 文本生成支持流式和非流式响应</p>
					<p>• 图片使用 picsum.photos 提供随机图片</p>
					<p>• 视频使用示例视频文件</p>
					<p>• 启动命令: npm run mock-server</p>
				</CardContent>
			</Card>
		</div>
	)
}
