import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { FormTips } from '@/components/common/form-tips'
import { aiAgentConfig } from '@/utils/ai-agent/ai-agent-config'
import { AIPlatform } from '@/utils/ai-agent/types'
import { isProd } from '@/utils/env'
import { useTheme } from 'next-themes'

import { useState, useEffect } from 'react'
import { chatHelper } from '../chat-helper'
import { useChatStore } from '../chat-store'

/**
 * 聊天设置对话框
 */
export const ChatSettings = () => {
	const { showSettings, setData, currStream } = useChatStore()
	const { currPlatform } = useChatStore()
	const { theme, setTheme } = useTheme()

	const [apiKey, setApiKey] = useState(aiAgentConfig.getApiKey(currPlatform))
	const [currTheme, setCurrTheme] = useState(theme)
	const [streamEnabled, setStreamEnabled] = useState(currStream)

	// showSettings 响应时更新状态
	useEffect(() => {
		if (showSettings) {
			setApiKey(aiAgentConfig.getApiKey(currPlatform))
			setCurrTheme(theme)
			setStreamEnabled(currStream)
		}
	}, [showSettings, currStream, theme])

	// 保存配置
	const saveConfigs = () => {
		aiAgentConfig.setApiKey(currPlatform, apiKey)
		aiAgentConfig.save()
		setTheme(currTheme || 'system') // next-themes 会自动处理持久化
		chatHelper.setStream(streamEnabled)
		setData({ showSettings: false })
	}

	// 切换平台
	const handlePlatformChange = (platform: AIPlatform) => {
		chatHelper.changePlatf(platform)
		setApiKey(aiAgentConfig.getApiKey(platform))
	}

	const platformList = Object.values(AIPlatform).filter((platform) => {
		if (platform === AIPlatform.Unknown) return false
		if (isProd && platform === AIPlatform.Mock) return false
		return true
	})

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			// 被动关闭（不保存修改）
			chatHelper.restorePersist()
			if (theme !== currTheme) {
				// 恢复原来的主题设置
				setCurrTheme(theme)
			}
		}
		setData({ showSettings: open })
	}

	return (
		<Dialog open={showSettings} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[500px]" aria-describedby="settings">
				<DialogHeader>
					<DialogTitle>设置</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{/* AI 平台 */}
					<FormTips label="AI 平台" help="选择使用的AI服务平台">
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
					</FormTips>

					{/* API Key */}
					<FormTips label="API Key" help="用于访问AI服务的密钥，会安全保存到本地" htmlFor="apiKey">
						<Input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="请输入API Key" />
					</FormTips>

					{/* 主题设置 */}
					<FormTips label="主题" help="选择界面的外观主题">
						<Select value={currTheme} onValueChange={setCurrTheme}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="light">浅色</SelectItem>
								<SelectItem value="dark">深色</SelectItem>
								<SelectItem value="system">跟随系统</SelectItem>
							</SelectContent>
						</Select>
					</FormTips>

					{/* 流式输出设置 */}
					<FormTips label="流式输出" help="开启后文本将逐字显示，关闭后一次性显示完整回复">
						<div className="flex items-center justify-between">
							<div className="text-sm text-muted-foreground">实时显示AI回复内容</div>
							<Switch checked={streamEnabled} onCheckedChange={setStreamEnabled} />
						</div>
					</FormTips>

					{/* 操作按钮 */}
					<div className="flex justify-end gap-2 pt-4">
						<Button variant="outline" onClick={() => handleOpenChange(false)}>
							取消
						</Button>
						<Button onClick={saveConfigs}>保存</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
