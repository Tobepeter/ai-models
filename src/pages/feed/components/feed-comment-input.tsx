import { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatar } from '@/components/common/user-avatar'
import { MessageCircle, Send, X } from 'lucide-react'
import { feedUtil } from '../feed-util'
import { cn } from '@/lib/utils'

/**
 * 评论输入弹窗组件
 */
export const CommentInputPopover = (props: CommentInputPopoverProps) => {
	const { postId, commentCount, onAddComment, replyTo, onClearReply, className } = props
	const [open, setOpen] = useState(false)

	useEffect(() => {
		if (replyTo) {
			setOpen(true)
		}
	}, [replyTo])

	const handleAddComment = async (content: string, replyToUser?: string) => {
		await onAddComment(content, replyToUser)
		setOpen(false)
		onClearReply?.()
	}

	const handleCancel = () => {
		setOpen(false)
		onClearReply?.()
	}

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen)
		if (!newOpen) {
			onClearReply?.()
		}
	}

	return (
		<Popover open={open} onOpenChange={handleOpenChange} data-slot="comment-input-popover">
			<PopoverTrigger asChild>
				<Button variant="ghost" size="sm" className={cn('h-8 px-2', className)}>
					<MessageCircle className="h-4 w-4 mr-1" />
					<span className="text-xs">{feedUtil.formatCount(commentCount)}</span>
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-[420px] p-0" align="start">
				<CommentInput 
					postId={postId} 
					replyTo={replyTo} 
					onSubmit={handleAddComment} 
					onCancel={replyTo ? handleCancel : undefined} 
				/>
			</PopoverContent>
		</Popover>
	)
}

/**
 * 评论输入框组件
 */
export const CommentInput = (props: CommentInputProps) => {
	const { postId, replyTo, placeholder, onSubmit, onCancel, className } = props
	const [content, setContent] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async () => {
		if (!content.trim() || isSubmitting) return

		setIsSubmitting(true)
		try {
			await onSubmit(content.trim(), replyTo)
			setContent('')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault()
			handleSubmit()
		}
	}

	const displayPlaceholder = placeholder || (replyTo ? `回复 ${replyTo}...` : '写下你的想法...')

	return (
		<div className={cn('p-4', className)} data-slot="comment-input">
			{replyTo && (
				<div className="flex items-center justify-between mb-3 p-2 bg-muted/50 rounded-lg">
					<span className="text-sm text-muted-foreground">
						回复 <span className="font-medium text-foreground">@{replyTo}</span>
					</span>
					{onCancel && (
						<Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onCancel}>
							<X className="h-3 w-3" />
						</Button>
					)}
				</div>
			)}

			<div className="flex space-x-3">
				<UserAvatar 
					src="https://i.pravatar.cc/150?img=1" 
					alt="当前用户头像" 
					size={36} 
					className="flex-shrink-0" 
					fallbackText="我" 
				/>

				<div className="flex-1 space-y-3">
					<Textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={displayPlaceholder}
						className="min-h-[100px] resize-none"
					/>

					<div className="flex justify-end space-x-2">
						{onCancel && !replyTo && (
							<Button variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
								取消
							</Button>
						)}
						<Button 
							size="sm" 
							onClick={handleSubmit} 
							disabled={!content.trim() || isSubmitting}
						>
							{isSubmitting ? (
								<>
									<div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
									发送中
								</>
							) : (
								<>
									<Send className="h-3 w-3 mr-1" />
									发送
								</>
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export interface CommentInputPopoverProps {
	postId: string
	commentCount: number
	onAddComment: (content: string, replyTo?: string) => void
	replyTo?: string
	onClearReply?: () => void
	className?: string
}

export interface CommentInputProps {
	postId: string
	replyTo?: string
	placeholder?: string
	onSubmit: (content: string, replyTo?: string) => void
	onCancel?: () => void
	className?: string
}