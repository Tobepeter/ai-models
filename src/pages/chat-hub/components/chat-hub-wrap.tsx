import { ChatHubCard as ChatHubCardType } from '../chat-hub-type'
import { ChatHubCard } from './chat-hub-card'

interface ChatHubWrapProps {
	cards: ChatHubCardType[]
}

/**
 * 卡片容器组件
 */
export const ChatHubWrap = (props: ChatHubWrapProps) => {
	const { cards } = props

	if (cards.length === 0) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<div className="text-center text-muted-foreground">
					<div className="text-lg mb-2">🤖 AI 对比助手</div>
					<p className="text-sm">选择AI模型并输入问题，开始对比不同AI的回答</p>
				</div>
			</div>
		)
	}

	return (
		<div className="flex-1 p-4 overflow-auto" data-slot="chat-hub-wrap">
			<div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-auto gap-4">
				{cards
					.filter((card) => card && card.id) // 过滤无效卡片
					.map((card) => (
						<ChatHubCard key={card.id} card={card} />
					))}
			</div>
		</div>
	)
}
