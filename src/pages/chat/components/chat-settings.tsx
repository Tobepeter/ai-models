import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/store'
import { aiAgentConfig } from '@/utils/ai-agent/ai-agent-config'
import { AIPlatform } from '@/utils/ai-agent/types'
import { useState } from 'react'
import { chatHelper } from '../chat-helper'
import { useChatStore } from '../chat-store'

/**
 * 聊天设置对话框
 */
export const ChatSettings = (props: ChatSettingsProps) => {
	const { open = false, onOpenChange } = props
	const { currPlatform } = useChatStore()
	const { theme, setTheme } = useAppStore()
	const [apiKey, setApiKey] = useState(aiAgentConfig.getApiKey(currPlatform))

	// 保存配置
	const saveConfigs = () => {
		aiAgentConfig.setApiKey(currPlatform, apiKey)
		aiAgentConfig.save()
		onOpenChange?.(false)
	}

	// 切换平台
	const handlePlatformChange = (platform: AIPlatform) => {
		chatHelper.switchPlatform(platform)
		setApiKey(aiAgentConfig.getApiKey(platform))
	}

	// 获取平台显示名称
	const getPlatformDisplayName = (platform: AIPlatform): string => {
		switch (platform) {
			case AIPlatform.Mock:
				return 'Mock (本地测试)'
			case AIPlatform.Silicon:
				return 'SiliconFlow'
			case AIPlatform.OpenRouter:
				return 'OpenRouter'
			default:
				return platform
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>设置</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* 平台选择 */}
					<div className="space-y-2">
						<Label>AI 平台</Label>
						<Select value={currPlatform} onValueChange={handlePlatformChange}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.values(AIPlatform).map((platform) => (
									<SelectItem key={platform} value={platform}>
										{getPlatformDisplayName(platform)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Separator />

					{/* 当前平台配置 */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<Label className="text-base font-medium">{getPlatformDisplayName(currPlatform)} 配置</Label>
						</div>

						{/* API Key */}
						<div className="space-y-2">
							<Label htmlFor="apiKey">API Key</Label>
							<Input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="请输入API Key" />
						</div>
					</div>

					<Separator />

					{/* 其他设置 */}
					<div className="space-y-4">
						<Label className="text-base font-medium">其他设置</Label>

						{/* 主题设置 */}
						<div className="space-y-2">
							<Label>主题</Label>
							<Select value={theme} onValueChange={setTheme}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="light">浅色</SelectItem>
									<SelectItem value="dark">深色</SelectItem>
									<SelectItem value="system">跟随系统</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* 操作按钮 */}
					<div className="flex justify-end space-x-2 pt-4">
						<Button variant="outline" onClick={() => onOpenChange?.(false)}>
							取消
						</Button>
						<Button onClick={saveConfigs}>保存</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export type ChatSettingsProps = {
	open?: boolean
	onOpenChange?: (open: boolean) => void
}
