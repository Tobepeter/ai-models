import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FeedDetailContent } from './feed-detail-content'
import { useFeedStore } from '../../feed-store'
import { feedUtil } from '../../core/feed-util'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

/**
 * Feed详情弹窗组件
 */
export const FeedDetailDialog = () => {
	const navigate = useNavigate()
	const isMobile = useIsMobile()

	const {
		isDetailDialogOpen,
		detailDialogPostId,
		posts,
		setData,
		addComment,
		// TODO: 添加评论点赞和回复的处理
	} = useFeedStore()

	// 获取当前显示的帖子
	const currPost = detailDialogPostId ? posts.find((p) => p.id === detailDialogPostId) : null

	// 处理弹窗关闭
	// 处理弹窗关闭
	const handleClose = () => {
		setData({ isDetailDialogOpen: false, detailDialogPostId: '' })
	}

	// 处理跳转到详情页
	// 处理跳转到详情页
	const handleNavigateToPage = (postId: string) => {
		handleClose()
		navigate(`/feed/${postId}`)
	}

	// 键盘事件处理
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isDetailDialogOpen) {
				handleClose()
			}
		}

		if (isDetailDialogOpen) {
			document.addEventListener('keydown', handleKeyDown)
			// 锁定背景滚动
			document.body.style.overflow = 'hidden'
		}

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.body.style.overflow = 'unset'
		}
	}, [isDetailDialogOpen])

	const contentClass = cn('p-0 pr-4', isMobile ? 'w-full h-full max-w-none max-h-none m-0 rounded-none' : 'w-[85vw] h-[85vh]')
	// const detailContentClass = 'h-full'
	// NOTE: 我是在是想不明白，为什么不能使用 100% 继承弹窗的高度，但是如果弹窗内部用到了 flex-1 的滚动条，底部必定溢出，必须使用 vh 单位，非常奇怪
	const detailContentClass = isMobile ? 'h-full' : 'h-[85vh]'

	// TODO: 如果找不到post

	return (
		<Dialog open={isDetailDialogOpen} onOpenChange={(open) => !open && handleClose()} data-slot="feed-detail-dialog">
			<DialogContent className={contentClass} style={isMobile ? {} : { maxWidth: 'unset' }}>
				{/* 隐藏的聚焦元素，避免自动聚焦到头部按钮 */}
				<div tabIndex={0} className="sr-only" />

				<DialogHeader className="sr-only">
					<DialogTitle>帖子详情</DialogTitle>
					<DialogDescription>查看帖子详情和评论</DialogDescription>
				</DialogHeader>

				<FeedDetailContent post={currPost} showNavigateButton={true} onNavigateToPage={handleNavigateToPage} className={detailContentClass} />
			</DialogContent>
		</Dialog>
	)
}
