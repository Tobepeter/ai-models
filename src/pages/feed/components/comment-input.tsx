import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatar } from '@/components/common/user-avatar'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentInputProps {
	postId: string
	replyTo?: string
	placeholder?: string
	onSubmit: (content: string, replyTo?: string) => void
	onCancel?: () => void
	className?: string
}

/* 评论输入组件 - 支持普通评论和回复评论 */
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

	const displayPlaceholder = placeholder || '输入你的回复...'

	return (
		<div className={cn('flex space-x-3 p-4 border-b border-border', className)}>
			<UserAvatar src="https://i.pravatar.cc/150?img=1" alt="当前用户头像" size={32} className="flex-shrink-0 mt-1" fallbackText="我" />

			<div className="flex-1 space-y-2">
				<Textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={displayPlaceholder}
					className="min-h-[80px] resize-none border-0 shadow-none focus-visible:ring-0 p-0"
					maxLength={500}
				/>

				<div className="flex items-center justify-between">
					<div className="text-xs text-muted-foreground">
						{content.length}/500 {content.length > 0 && '• Cmd+Enter 发送'}
					</div>

					<div className="flex items-center space-x-2">
						{onCancel && (
							<Button variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
								取消
							</Button>
						)}

						<Button size="sm" onClick={handleSubmit} disabled={!content.trim() || isSubmitting} className="min-w-[60px]">
							{isSubmitting ? (
								<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
