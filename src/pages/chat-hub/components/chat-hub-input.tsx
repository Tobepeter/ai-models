import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useChatHubStore } from '../chat-hub-store'
import { ChatHubModelSelector } from './chat-hub-model-selector'
import { ModelConfig } from '../chat-hub-type'
import { mockModelConfig } from '@/utils/ai-agent/mock-agent'

// 从 mock-agent 生成所有可用模型
const allModels: ModelConfig[] = mockModelConfig.text.map((model, idx) => ({
	id: `text-${idx}`,
	platform: 'mock',
	model: model,
	name: model
		.replace('mock-', 'Mock ')
		.replace('-', ' ')
		.replace(/\b\w/g, (l) => l.toUpperCase()), // deep seek -> Deep Seek
}))

/**
 * 输入组件
 */
export const ChatHubInput = () => {
	const { isGenerating, selectedModels, startGeneration, stopGeneration, setSelectedModels } = useChatHubStore()
	const [inputVal, setInputVal] = useState('')
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSubmit()
		} else if (e.key === 'Escape') {
			if (isGenerating) {
				stopGeneration()
			} else {
				textareaRef.current?.blur()
			}
		}
	}

	const handleSubmit = async () => {
		if (isGenerating) {
			stopGeneration()
		} else if (inputVal.trim() && selectedModels.length > 0) {
			await startGeneration(inputVal.trim())
			setInputVal('')
			textareaRef.current?.blur()
		}
	}

	const canSubmit = inputVal.trim() && selectedModels.length > 0 && !isGenerating

	return (
		<div className="border-t bg-background p-4">
			<div className="max-w-4xl mx-auto space-y-4">
				{/* 模型选择器 */}
				<div>
					<div className="text-sm text-muted-foreground mb-2">选择AI模型</div>
					<ChatHubModelSelector models={allModels} selectedModels={selectedModels} onChange={setSelectedModels} disabled={isGenerating} />
				</div>

				{/* 输入区域 */}
				<div className="flex gap-3 items-end">
					<div className="flex-1">
						<Textarea
							ref={textareaRef}
							value={inputVal}
							onChange={(e) => setInputVal(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="输入您的问题..."
							className="min-h-[60px] resize-none"
							disabled={isGenerating}
						/>
					</div>
					<Button onClick={handleSubmit} disabled={!canSubmit && !isGenerating} variant={isGenerating ? 'destructive' : 'default'} size="lg" className="px-6">
						{isGenerating ? '停止' : '发送'}
					</Button>
				</div>
			</div>
		</div>
	)
}
