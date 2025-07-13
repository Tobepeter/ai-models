import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
export const ChatSettings = () => {
	const { showSettings, setData } = useChatStore()
	const { currPlatform } = useChatStore()
	const { theme, setTheme } = useAppStore()
	const [apiKey, setApiKey] = useState(aiAgentConfig.getApiKey(currPlatform))

	// 保存配置
	const saveConfigs = () => {
		aiAgentConfig.setApiKey(currPlatform, apiKey)
		aiAgentConfig.save()
		setData({ showSettings: false })
	}

	// 切换平台
	const handlePlatformChange = (platform: AIPlatform) => {
		chatHelper.switchPlatform(platform)
		setApiKey(aiAgentConfig.getApiKey(platform))
	}

	const platformList = Object.values(AIPlatform).filter((platform) => platform !== AIPlatform.Unknown)

	return (
		<Dialog open={showSettings} onOpenChange={(open) => setData({ showSettings: open })}>
			<DialogContent className="sm:max-w-[500px]" aria-describedby="settings">
				<DialogHeader>
					<DialogTitle>设置</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* 平台选择 */}
					<div className="flex flex-col gap-4">
						<Label>AI 平台</Label>
						<Select value={currPlatform} onValueChange={handlePlatformChange}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{platformList.map((platform) => (
									<SelectItem key={platform} value={platform}>
										{platform}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Separator />

					{/* API Key */}
					<div className="flex flex-col gap-4">
						<Label htmlFor="apiKey">API Key</Label>
						<Input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="请输入API Key" />
					</div>

					<Separator />

					{/* 主题设置 */}
					<div className="flex flex-col gap-4">
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

					{/* 操作按钮 */}
					<div className="flex justify-end space-x-2 pt-4">
						<Button variant="outline" onClick={() => setData({ showSettings: false })}>
							取消
						</Button>
						<Button onClick={saveConfigs}>保存</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
