import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Settings } from 'lucide-react'
import { useState } from 'react'
import { chatHelper } from '../chat-helper'
import { useChatStore } from '../chat-store'
import { ChatSettings } from './chat-settings'

/**
 * 聊天工具栏组件
 */
export const ChatToolbar = () => {
	const { currModel } = useChatStore()
	const [showSettings, setShowSettings] = useState(false)
	const modelOptions = chatHelper.getModelOptions()

	const handleModelChange = (model: string) => {
		chatHelper.setModel(model)
	}

	return (
		<div className="flex items-center justify-between px-4 py-2 border-b bg-card">
			<div className="flex items-center space-x-4">
				{/* 模型选择 */}
				<div className="flex items-center space-x-2">
					<span className="text-sm text-muted-foreground">模型:</span>
					<Select value={currModel} onValueChange={handleModelChange}>
						<SelectTrigger className="w-72">
							<SelectValue placeholder="选择模型" />
						</SelectTrigger>
						<SelectContent>
							{modelOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* 右侧操作按钮 */}
			<div className="flex items-center space-x-2">
				<Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
					<Settings className="h-4 w-4" />
				</Button>
				<Button variant="ghost" size="sm">
					<Plus className="h-4 w-4" />
				</Button>
			</div>

			{/* 设置对话框 */}
			<ChatSettings open={showSettings} onOpenChange={setShowSettings} />
		</div>
	)
}
