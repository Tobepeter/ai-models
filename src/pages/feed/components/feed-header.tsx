import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import { feedUtil } from '../feed-util'
import { cn } from '@/lib/utils'

/**
 * 信息流头部组件 - 显示用户头像、用户名、状态和时间
 */
export const FeedHeader = (props: FeedHeaderProps) => {
	const { userId, username, avatar, status, createdAt, className } = props

	return (
		<div className={cn('flex items-start justify-between', className)} data-slot="feed-header">
			{/* 左侧用户信息 */}
			<div className="flex items-start space-x-3 flex-1 min-w-0">
				<UserAvatar src={avatar} alt={`${username}的头像`} size={40} className="flex-shrink-0" fallbackText={username.charAt(0)} />

				<div className="flex-1 min-w-0">
					<div className="flex items-center space-x-2">
						<span className="font-medium text-sm text-foreground truncate">{username}</span>
						{status && (
							<span className="text-lg flex-shrink-0" title="状态">
								{status}
							</span>
						)}
					</div>

					<div className="text-xs text-muted-foreground mt-0.5">{feedUtil.formatTime(createdAt)}</div>
				</div>
			</div>

			{/* 右侧更多操作 */}
			<Button
				variant="ghost"
				size="sm"
				className="h-8 w-8 p-0 flex-shrink-0 text-muted-foreground hover:text-foreground"
				onClick={(e) => {
					e.stopPropagation()
					console.log('更多操作:', userId) // TODO: 实现更多操作菜单
				}}
			>
				<MoreHorizontal className="h-4 w-4" />
			</Button>
		</div>
	)
}

export interface FeedHeaderProps {
	userId: string
	username: string
	avatar: string
	status?: string
	createdAt: string
	className?: string
}
