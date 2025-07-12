import { useMount } from 'ahooks'
import { aiAgentMgr } from '@/utils/ai-agent/ai-agent-mgr'
import { AIPlatform } from '@/utils/ai-agent/types'
import { useChatHubStore } from './chat-hub-store'
import { ChatHubWrap } from './components/chat-hub-wrap'
import { ChatHubInput } from './components/chat-hub-input'

/**
 * Chat Hub 主页面 - 多AI对比聊天
 */
export const ChatHub = () => {
	const { cards } = useChatHubStore()

	useMount(() => {
		// 初始化 Mock 平台
		aiAgentMgr.switchPlatform(AIPlatform.Mock)
		aiAgentMgr.setConfig({
			apiKey: 'mock-key', // Mock 不需要真实 API Key
		})
	})

	return (
		<div className="flex flex-col h-screen bg-background">
			{/* 头部 */}
			<div className="flex-shrink-0 border-b bg-card px-4 py-3">
				<h1 className="text-lg font-semibold">
					AI 对比助手
					<span className="text-sm font-normal text-muted-foreground ml-2">
						同时对比多个AI模型的回答
					</span>
				</h1>
			</div>

			{/* 卡片区域 */}
			<ChatHubCardsContainer cards={cards} />

			{/* 输入区域 */}
			<div className="flex-shrink-0">
				<ChatHubInput />
			</div>
		</div>
	)
}
