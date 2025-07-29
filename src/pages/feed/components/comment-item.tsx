import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/common/user-avatar'
import { Heart, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { type Comment } from '../feed-store'
import { feedUtil } from '../feed-util'
import { cn } from '@/lib/utils'

interface CommentItemProps {
	comment: Comment
	onReply: (username: string) => void
	onLike?: (commentId: string) => void
	className?: string
}

/**
 * 单条评论组件
 * 支持显示回复关系和交互操作
 */
export const CommentItem = (props: CommentItemProps) => {
	const { comment, onReply, onLike, className } = props
	const [isLiked, setIsLiked] = useState(comment.isLiked)
	const [likeCount, setLikeCount] = useState(comment.likeCount)

	const handleLike = () => {
		if (onLike) {
			onLike(comment.id)
		}

		// 乐观更新
		setIsLiked(!isLiked)
		setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
	}

	const handleReply = () => {
		onReply(comment.username)
	}

	return (
		<div className={cn('flex space-x-3 p-4 hover:bg-accent/5 transition-colors', className)}>
			{/* 用户头像 */}
			<UserAvatar src={comment.avatar} alt={`${comment.username}的头像`} size={32} className="flex-shrink-0" fallbackText={comment.username.charAt(0)} />

			{/* 评论内容 */}
			<div className="flex-1 min-w-0 space-y-1">
				{/* 用户名和时间 */}
				<div className="flex items-center space-x-2">
					<span className="font-medium text-sm text-foreground">{comment.username}</span>
					<span className="text-xs text-muted-foreground">{feedUtil.formatTime(comment.createdAt)}</span>
				</div>

				{/* 评论文本 */}
				<div className="text-sm text-foreground leading-relaxed">
					{comment.replyTo && <span className="text-primary mr-1">回复 @{comment.replyTo}:</span>}
					<span className="break-words">{comment.content}</span>
				</div>

				{/* 交互按钮 */}
				<div className="flex items-center space-x-4 pt-1">
					{/* 点赞按钮 */}
					<Button
						variant="ghost"
						size="sm"
						className={cn('h-6 px-1 text-xs transition-colors', isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500')}
						onClick={handleLike}
					>
						<motion.div whileTap={{ scale: 1.2 }} transition={{ duration: 0.1 }} className="mr-1">
							<Heart className={cn('h-3 w-3 transition-colors', isLiked && 'fill-current')} />
						</motion.div>
						{likeCount > 0 && <span>{feedUtil.formatCount(likeCount)}</span>}
					</Button>

					{/* 回复按钮 */}
					<Button variant="ghost" size="sm" className="h-6 px-1 text-xs text-muted-foreground hover:text-blue-500 transition-colors" onClick={handleReply}>
						<MessageCircle className="h-3 w-3 mr-1" />
						回复
					</Button>
				</div>
			</div>
		</div>
	)
}
