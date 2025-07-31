import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { MessageCircle, Send, X } from 'lucide-react'
import { useEffect, useState, type PropsWithChildren } from 'react'
import { useFeedStore } from '../../feed-store'
import { feedUtil } from '../../feed-util'

/**
 * 评论输入弹窗组件 - 使用 Popover
 */
export const CommentInputPopup = (props: PropsWithChildren<CommentInputPopupProps>) => {
	const { postId, onAddComment, replyTo, className, children } = props
	const { showMask, hideMask } = useFeedStore()
	const [isOpen, setIsOpen] = useState(false)
	const [content, setContent] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	// 当 replyTo 变化时自动打开
	useEffect(() => {
		if (replyTo) {
			setContent(`@${replyTo} `)
			setIsOpen(true)
		}
	}, [replyTo])

	// 监听 popover 开关状态，控制蒙层
	useEffect(() => {
		if (isOpen) {
			showMask()
		} else {
			hideMask()
		}
	}, [isOpen])

	// 监听蒙层状态，蒙层关闭时同时关闭popup
	useEffect(() => {
		const unsubscribe = useFeedStore.subscribe((state) => {
			if (!state.isMaskOpen && isOpen) {
				setIsOpen(false)
				setContent('')
			}
		})
		return unsubscribe
	}, [isOpen])

	// 提交评论
	const handleSubmit = () => {
		if (!content.trim() || isSubmitting) return

		setIsSubmitting(true)
		try {
			onAddComment(content.trim(), replyTo)
			setContent('')
			setIsOpen(false)
		} finally {
			setIsSubmitting(false)
		}
	}

	// 取消评论
	const handleCancel = () => {
		setIsOpen(false)
		setContent('')
	}

	// 处理键盘事件
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault()
			handleSubmit()
		}

		// 防止删除@username前缀
		if (replyTo && (e.key === 'Backspace' || e.key === 'Delete')) {
			const target = e.target as HTMLTextAreaElement
			const { selectionStart, selectionEnd } = target
			const atMention = `@${replyTo} `

			if (selectionStart <= atMention.length || (selectionStart !== selectionEnd && selectionEnd <= atMention.length)) {
				// 如果选择或光标位置会影响到@mention，阻止删除
				e.preventDefault()
			}
		}
	}

	const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		// 处理内容变化
		const newContent = e.target.value

		// 如果是回复模式，确保@username前缀不被删除
		if (replyTo) {
			const atMention = `@${replyTo} `
			if (!newContent.startsWith(atMention)) {
				setContent(atMention)
				return
			}
		}

		setContent(newContent)
	}

	// 处理触发器点击
	const handleTriggerClick = () => {
		// 如果是回复模式且内容为空，重新设置内容以确保能打开
		if (replyTo && !content) {
			setContent(`@${replyTo} `)
		}
		setIsOpen(true)
	}

	const displayPlaceholder = replyTo ? `回复 ${replyTo}...` : '写下你的想法...'

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<div className={cn('inline-block cursor-pointer', className)} onClick={handleTriggerClick}>
					{children}
				</div>
			</PopoverTrigger>

			{/* 弹窗内容 */}
			<PopoverContent className="w-[420px] p-0">
				<div className="p-4">
					{replyTo && (
						<div className="flex items-center justify-between mb-3 p-2 bg-muted/50 rounded-lg">
							<span className="text-sm text-muted-foreground">
								回复 <span className="font-medium text-foreground">@{replyTo}</span>
							</span>
							<Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleCancel}>
								<X className="h-3 w-3" />
							</Button>
						</div>
					)}

					<div className="flex space-x-3">
						<UserAvatar src="https://i.pravatar.cc/150?img=1" alt="当前用户头像" size={36} className="flex-shrink-0" fallbackText="我" />

						<div className="flex-1 space-y-3">
							<Textarea value={content} onChange={handleContentChange} onKeyDown={handleKeyDown} placeholder={displayPlaceholder} className="min-h-[100px] resize-none" autoFocus />

							<div className="flex justify-end space-x-2">
								<Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSubmitting}>
									取消
								</Button>
								<Button size="sm" onClick={handleSubmit} disabled={!content.trim() || isSubmitting}>
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
			</PopoverContent>
		</Popover>
	)
}

/**
 * 评论按钮组件 - 包装 CommentInputPopup 显示评论数量
 */
export const CommentInput = (props: CommentInputProps) => {
	const { postId, commentCount, onAddComment, replyTo, className } = props
	return (
		<CommentInputPopup postId={postId} onAddComment={onAddComment} replyTo={replyTo} className={className}>
			<Button variant="ghost" size="sm" className="h-8 px-2">
				<MessageCircle className="h-4 w-4 mr-1" />
				<span className="text-xs">{feedUtil.formatCount(commentCount)}</span>
			</Button>
		</CommentInputPopup>
	)
}

interface CommentInputPopupProps {
	postId: string
	onAddComment: (content: string, replyTo?: string) => void
	replyTo?: string
	className?: string
}

interface CommentInputProps {
	postId: string
	commentCount: number
	onAddComment: (content: string, replyTo?: string) => void
	replyTo?: string
	className?: string
}

export { type CommentInputPopupProps, type CommentInputProps }
