import { ChatHubCard as ChatHubCardType } from '../chat-hub-type'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const statusConfig = {
	'not-started': { label: '未开始', variant: 'secondary' as const },
	pending: { label: '等待中', variant: 'default' as const },
	generating: { label: '生成中', variant: 'default' as const },
	completed: { label: '已完成', variant: 'default' as const },
	error: { label: '错误', variant: 'destructive' as const },
}

/**
 * AI回答卡片组件
 */
export const ChatHubCard = (props: ChatHubCardProps) => {
	const { card } = props

	// 防御性检查
	if (!card || !card.id) {
		console.error('ChatHubCard: Invalid card data', card)
		return null
	}

	const config = statusConfig[card.status] || statusConfig['not-started']

	const formatTime = (timestamp?: number) => {
		if (!timestamp) return '--'
		return new Date(timestamp).toLocaleTimeString()
	}

	const getDuration = () => {
		if (!card.startTime || !card.endTime) return '--'
		const duration = card.endTime - card.startTime
		return `${(duration / 1000).toFixed(1)}s`
	}

	return (
		<Card className="min-h-[300px] flex flex-col">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
				<h3 className="font-semibold">{card.modelName}</h3>
				<Badge variant={config.variant}>{config.label}</Badge>
			</CardHeader>

			<CardContent className="flex-1 flex flex-col overflow-hidden pt-0">
				{/* 问题区域 */}
				<div className="mb-4 pb-3 border-b">
					<div className="text-xs text-muted-foreground mb-1">问题</div>
					<div className="text-sm">{card.question || '等待输入问题...'}</div>
				</div>

				{/* 回答区域 */}
				<div className="flex-1 overflow-hidden">
					<div className="text-xs text-muted-foreground mb-2">回答</div>
					<div className="text-sm leading-relaxed overflow-y-auto h-full">
						{card.status === 'error' && card.error ? (
							<div className="text-destructive">错误: {card.error}</div>
						) : card.answer ? (
							<div className="whitespace-pre-wrap">{card.answer}</div>
						) : (
							<div className="text-muted-foreground">
								{card.status === 'not-started' && '准备开始...'}
								{card.status === 'pending' && '等待响应...'}
								{card.status === 'generating' && '正在生成...'}
							</div>
						)}
					</div>
				</div>

				{/* 卡片底部 */}
				<div className="pt-3 border-t text-xs text-muted-foreground flex justify-between">
					<span>{config.label}</span>
					<span>{card.status === 'completed' ? getDuration() : formatTime(card.timestamp)}</span>
				</div>
			</CardContent>
		</Card>
	)
}

export interface ChatHubCardProps {
	card: ChatHubCardType
}
