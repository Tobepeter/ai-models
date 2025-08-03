import { useParams, useNavigate } from 'react-router-dom'
import { FeedDetailContent } from './components/detail/feed-detail-content'
import { Empty } from '@/components/common/empty'
import { FileQuestion } from 'lucide-react'

/**
 * Feed详情组件
 */
export const FeedDetail = () => {
	const { postId } = useParams<{ postId: string }>()
	const navigate = useNavigate()

	// 导航函数
	const handleNavigateToFeed = () => navigate('/feed')

	// 如果没有 postId，返回 404
	if (!postId) {
		return <Empty icon={<FileQuestion className="h-16 w-16 text-muted-foreground" />} title="页面不存在" buttonText="返回Feed页" onClickButton={handleNavigateToFeed} />
	}

	return (
		<div className="h-full bg-background" data-slot="feed-detail">
			{/* 详情内容 */}
			<div className="container max-w-4xl mx-auto py-6 h-full">
				<FeedDetailContent
					postId={postId}
					showNavigateButton={false} // 详情页不需要跳转按钮
					className="h-full"
				/>
			</div>
		</div>
	)
}
