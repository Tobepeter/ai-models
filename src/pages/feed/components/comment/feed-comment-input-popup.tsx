import { UserAvatar } from '@/components/common/user-avatar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { Send, X } from 'lucide-react'
import { useState, useEffect, useRef, type PropsWithChildren } from 'react'
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
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	// 获取保护区域长度
	const getProtectedLength = () => (replyTo ? `@${replyTo} `.length : 0)

	// 监听内容变化，确保回复模式下光标位置正确
	useEffect(() => {
		if (isOpen && replyTo && textareaRef.current) {
			const textarea = textareaRef.current
			const atMention = `@${replyTo} `

			// 如果内容刚刚设置为@username，将光标移动到末尾
			if (content === atMention) {
				setTimeout(() => {
					textarea.setSelectionRange(atMention.length, atMention.length)
					textarea.focus()
				}, 0)
			}
		}
	}, [isOpen, replyTo, content])

	// NOTE: 这个逻辑很别扭，不过能工作，唯一的缺点点击时候会闪烁一下
	// 处理选择变化，阻止选择保护区域
	const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
		if (!replyTo) return

		const textarea = e.currentTarget
		const protectedLength = getProtectedLength()

		// 如果选择范围涉及保护区域，直接阻止并重置到安全位置
		if (textarea.selectionStart < protectedLength || textarea.selectionEnd < protectedLength) {
			e.preventDefault()
			// 立即重置到安全位置，不通过状态更新
			textarea.setSelectionRange(protectedLength, protectedLength)
		}
	}

	// 统一管理弹窗开关状态
	const changeIsOpen = (newIsOpen: boolean) => {
		// 如果要打开弹窗，检查是否有其他弹窗已打开
		if (newIsOpen) {
			const { isCommentInputOpen, lastCommentCloseTime } = useFeedStore.getState()

			// 如果有其他弹窗打开，阻止操作
			if (isCommentInputOpen) return

			// 目前有一个问题，先打开a，点击b，会先关闭a，这时候b可以打开了
			// 如果刚刚关闭了弹窗，也阻止打开，防止快速切换
			const delta = Date.now() - lastCommentCloseTime
			const delay = 300 // NOTE: 我也不知道为什么这么卡，我打开居然时间差能到300ms以上
			if (lastCommentCloseTime > 0 && delta < delay) return

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
	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		const textarea = e.currentTarget
		const protectedLength = getProtectedLength()

		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault()
			handleSubmit()
			return
		}

		// 防止删除@username前缀
		if (replyTo && (e.key === 'Backspace' || e.key === 'Delete')) {
			const { selectionStart, selectionEnd } = textarea
			const atMention = `@${replyTo} `

			if (selectionStart <= atMention.length || (selectionStart !== selectionEnd && selectionEnd <= atMention.length)) {
				// 如果选择或光标位置会影响到@mention，阻止删除
				e.preventDefault()
			}
		}

		// 处理方向键，防止光标移动到保护区域
		if (replyTo && (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'Home')) {
			const { selectionStart } = textarea
			// 如果当前光标在保护区域边界或内部，且按键会让光标进入保护区域，则阻止
			if ((e.key === 'ArrowLeft' && selectionStart <= protectedLength) || (e.key === 'ArrowUp' && selectionStart < protectedLength) || e.key === 'Home') {
				e.preventDefault()
				textarea.setSelectionRange(protectedLength, protectedLength)
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
							<Textarea
								ref={textareaRef}
								value={content}
								onChange={handleContentChange}
								onKeyDown={handleKeyDown}
								onSelect={handleSelect}
								placeholder={displayPlaceholder}
								className="min-h-[100px] resize-none"
								autoFocus
							/>

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

export interface CommentInputPopupProps {
	postId: string
	onAddComment: (content: string, replyTo?: string) => void
	replyTo?: string
	className?: string
}
