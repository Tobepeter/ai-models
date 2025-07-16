import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useChatHubStore } from '../chat-hub-store'
import { ChatHubModelSelector } from './chat-hub-model-selector'

/**
 * 输入组件
 */
export const ChatHubInput = () => {
	const { isGenerating, models, startGeneration, stopGeneration, toggleModel } = useChatHubStore()
	const selectedModels = models.filter((m) => m.enabled)
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
					<ChatHubModelSelector
						models={models}
						selectedModels={selectedModels}
						onChange={(newSelectedModels) => {
							// Update model enabled status based on selection
							models.forEach((model) => {
								const shouldBeEnabled = newSelectedModels.some((sm) => sm.id === model.id)
								if (model.enabled !== shouldBeEnabled) {
									toggleModel(model.id)
								}
							})
						}}
						disabled={isGenerating}
					/>
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
