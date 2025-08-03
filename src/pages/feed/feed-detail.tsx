import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FeedDetailContent } from './components/detail/feed-detail-content'
import { useFeedDetailStore } from './feed-detail-store'
import { feedDetailMgr } from './core/feed-detail-mgr'
import { Empty } from '@/components/common/empty'
import { FeedSkeleton } from './components/feed-skeleton'
import { FileQuestion, WifiOff } from 'lucide-react'

/**
 * Feed详情组件
 */
export const FeedDetail = () => {
	const { postId } = useParams<{ postId: string }>()
	const navigate = useNavigate()

	const { currentPost, loading, error } = useFeedDetailStore()

	// 导航函数
	const handleNavigateToFeed = () => navigate('/feed')

	// 初始化数据
	useEffect(() => {
		if (postId) {
			feedDetailMgr.enterPage(postId)
		}

		// 组件卸载时清理
		return () => {
			feedDetailMgr.closeDetail()
		}
	}, [postId])

	// 如果没有 postId，返回 404
	if (!postId) {
		return <Empty icon={<FileQuestion className="h-16 w-16 text-muted-foreground" />} title="页面不存在" buttonText="返回Feed页" onClickButton={handleNavigateToFeed} />
	}

	// 加载中状态
	if (loading) {
		return (
			<div className="container max-w-4xl mx-auto py-6">
				<FeedSkeleton count={1} />
			</div>
		)
	}

	// 错误状态
	if (error) {
		return <Empty icon={<WifiOff className="h-16 w-16 text-muted-foreground" />} title="加载失败" desc={error} buttonText="重试" onClickButton={() => postId && feedDetailMgr.enterPage(postId)} />
	}

	return (
		<div className="h-full bg-background" data-slot="feed-detail">
			{/* 详情内容 */}
			<div className="container max-w-4xl mx-auto py-6 h-full">
				<FeedDetailContent
					post={currentPost}
					showNavigateButton={false} // 详情页不需要跳转按钮
					className="h-full"
				/>
			</div>
		</div>
	)
}
