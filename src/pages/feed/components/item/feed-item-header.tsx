import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Flag, Trash2, MoreHorizontal, ExternalLink } from 'lucide-react'
import { feedUtil } from '../../feed-util'
import { cn } from '@/lib/utils'
import { notify } from '@/components/common/notify'

/**
 * 信息流头部组件 - 显示用户头像、用户名、状态和时间
 */
export const FeedItemHeader = (props: FeedItemHeaderProps) => {
	const { userId, username, avatar, status, createdAt, showNavigateButton, onNavigateToPage, className } = props

	// 删除操作处理
	const handleDelete = () => {
		notify.confirm({
			title: '确认删除',
			description: '此操作将永久删除该帖子，是否继续？',
			confirmText: '删除',
			cancelText: '取消',
			onConfirm: () => {
				console.log('删除帖子:', userId)
				notify.success('帖子已删除')
			},
			onCancel: () => {
				console.log('取消删除操作')
			},
		})
	}

	// 更多操作配置
	const moreActions = [
		{
			key: 'report',
			label: '举报',
			icon: Flag,
			onClick: () => console.log('举报用户:', userId),
		},
		{
			key: 'delete',
			label: '删除',
			icon: Trash2,
			onClick: handleDelete,
		},
	]

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

			{/* 右侧操作按钮区域 */}
			<div className="flex items-center space-x-2">
				{/* 新页面打开按钮 */}
				{showNavigateButton && (
					<Button
						variant="ghost"
						size="sm"
						className="square-4 p-0 flex-shrink-0 text-muted-foreground hover:text-foreground"
						onClick={(e) => {
							e.stopPropagation()
							onNavigateToPage?.(userId)
						}}
						title="新页面打开"
					>
						<ExternalLink className="square-4" />
					</Button>
				)}

				{/* 更多操作 */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="square-8 p-0 flex-shrink-0 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
							<MoreHorizontal className="square-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
						{moreActions.map((action) => (
							<DropdownMenuItem
								key={action.key}
								onClick={(e) => {
									e.stopPropagation()
									action.onClick()
								}}
							>
								<action.icon className="square-4 mr-2" />
								{action.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	)
}

export interface FeedItemHeaderProps {
	userId: string
	username: string
	avatar: string
	status?: string
	createdAt: string
	showNavigateButton?: boolean
	onNavigateToPage?: (postId: string) => void
	className?: string
}
