import { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { CommentInput } from './comment-input'
import { feedUtil } from '../feed-util'
import { cn } from '@/lib/utils'

interface CommentInputPopoverProps {
	postId: string
	commentCount: number
	onAddComment: (content: string, replyTo?: string) => void
	replyTo?: string
	onClearReply?: () => void
	className?: string
}

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
		<Popover open={open} onOpenChange={handleOpenChange}>
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
