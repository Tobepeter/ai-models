import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { Send, X } from 'lucide-react'
import { useState, type PropsWithChildren } from 'react'
import { useFeedStore } from '../../feed-store'

/**
 * 评论输入弹窗组件 - 使用 Popover
 */
export const CommentInputPopup = (props: PropsWithChildren<CommentInputPopupProps>) => {
	const { onAddComment, replyTo, className, children } = props
	const { setCommentInputOpen } = useFeedStore()
	const [isOpen, setIsOpen] = useState(false)
	const [content, setContent] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	// 统一管理弹窗开关状态
	const changeIsOpen = (newIsOpen: boolean) => {
		// 如果要打开弹窗，检查是否有其他弹窗已打开
		if (newIsOpen) {
			const { isCommentInputOpen, lastCommentCloseTime } = useFeedStore.getState()
			
			// 如果有其他弹窗打开，阻止操作
			if (isCommentInputOpen) return
			
			// 目前有一个问题，先打开a，点击b，会先关闭a，这时候b可以打开了
			// 如果刚刚关闭了弹窗（100ms内），也阻止打开，防止快速切换
			if (lastCommentCloseTime > 0 && Date.now() - lastCommentCloseTime < 100) return

			// 如果是回复模式且内容为空，设置初始内容
			if (replyTo && !content) {
				setContent(`@${replyTo} `)
			}
		}

		setIsOpen(newIsOpen)
		setCommentInputOpen(newIsOpen)
		if (!newIsOpen) {
			setContent('')
		}
	}

	// 提交评论
	const handleSubmit = () => {
		if (!content.trim() || isSubmitting) return

		setIsSubmitting(true)
		try {
			onAddComment(content.trim(), replyTo)
			changeIsOpen(false)
		} finally {
			setIsSubmitting(false)
		}
	}

	// 取消评论
	const handleCancel = () => {
		changeIsOpen(false)
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

	// 监听内容变化
	const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

	const displayPlaceholder = replyTo ? `回复 ${replyTo}...` : '写下你的想法...'

	return (
		<Popover open={isOpen} onOpenChange={changeIsOpen}>
			<PopoverTrigger asChild>
				<div className={className}>{children}</div>
			</PopoverTrigger>

			{/* 弹窗内容 */}
			<PopoverContent className="w-[420px] p-0">
				<div className="p-4">
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

interface CommentInputPopupProps {
	postId: string
	onAddComment: (content: string, replyTo?: string) => void
	replyTo?: string
	className?: string
}

export { type CommentInputPopupProps }
