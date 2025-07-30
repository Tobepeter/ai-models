import { useMount, useUnmount } from 'ahooks'
import { aiAgentMgr } from '@/utils/ai-agent/ai-agent-mgr'
import { AIPlatform } from '@/utils/ai-agent/types'
import { isDev } from '@/utils/env'
import { useChatHubStore } from './chat-hub-store'
import { ChatHubWrap } from './components/chat-hub-wrap'
import { ChatHubInput } from './components/chat-hub-input'
import { aiAgentConfig } from '@/utils/ai-agent/ai-agent-config'
import { chatHubMgr } from './chat-hub-mgr'

/**
 * Chat Hub 主页面 - 多AI对比聊天
 */
export const ChatHub = () => {
	const { cards } = useChatHubStore()

	useMount(() => {
		aiAgentConfig.restore()
		const defaultPlatform = isDev ? AIPlatform.Mock : AIPlatform.Silicon
		aiAgentMgr.switchPlatform(defaultPlatform)
	})

	useUnmount(() => {
		chatHubMgr.clearCache()
	})

	return (
		<div className="flex flex-col h-full bg-background" data-slot="chat-hub">
			{/* 卡片区域 */}
			<ChatHubWrap cards={cards} />

			{/* 输入区域 */}
			<div className="flex-shrink-0">
				<ChatHubInput />
			</div>
		</div>
	)
}
