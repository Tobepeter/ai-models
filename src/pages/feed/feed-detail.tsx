import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FeedDetailContent } from './components/feed-detail-content'
import { useFeedStore } from './feed-store'
import { feedUtil } from './feed-util'
import { feedMgr } from './feed-mgr'

/**
 * Feed详情组件
 */
export const FeedDetail = () => {
	const { postId } = useParams<{ postId: string }>()
	
	const { 
		posts, 
		postsById,
		loading,
		error,
		addComment,
	} = useFeedStore()

	// 获取当前帖子
	const currentPost = postId 
		? (postsById[postId] || posts.find(p => p.id === postId))
		: null



	// 处理添加评论
	const handleAddComment = (postId: string, content: string, replyTo?: string) => {
		const newComment = feedUtil.createComment(postId, content, replyTo)
		addComment(postId, newComment)
	}

	// 处理评论点赞
	const handleLikeComment = (commentId: string) => {
		// TODO: 实现评论点赞逻辑
		console.log('点赞评论:', commentId)
	}

	// 处理回复
	const handleReply = (postId: string, username: string) => {
		// TODO: 实现回复逻辑
		console.log('回复用户:', username, '在帖子:', postId)
	}

	// 初始化数据
	useEffect(() => {
		if (postId && !currentPost && !loading) {
			// 如果没有找到帖子数据，尝试加载
			feedMgr.loadInitial()
		}
	}, [postId, currentPost, loading])

	// 如果没有 postId，返回 404
	if (!postId) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">页面不存在</h1>
					<p className="text-muted-foreground">请使用导航栏返回</p>
				</div>
			</div>
		)
	}

	// 加载中状态
	if (loading && !currentPost) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">加载中...</p>
				</div>
			</div>
		)
	}

	// 错误状态
	if (error && !currentPost) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-xl font-semibold mb-4">加载失败</h1>
					<p className="text-muted-foreground mb-4">{error}</p>
					<Button onClick={() => feedMgr.loadInitial()}>重试</Button>
				</div>
			</div>
		)
	}

	// 帖子不存在
	if (!currentPost) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-xl font-semibold mb-4">帖子不存在</h1>
					<p className="text-muted-foreground">该帖子可能已被删除或不存在，请使用导航栏返回</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-background">
			{/* 详情内容 */}
			<div className="container max-w-4xl mx-auto py-6">
				<div className="bg-card rounded-lg shadow-sm overflow-hidden">
					<FeedDetailContent
						post={currentPost}
						showNavigateButton={false} // 详情页不需要跳转按钮
						onAddComment={handleAddComment}
						onLikeComment={handleLikeComment}
						onReply={handleReply}
					/>
				</div>
			</div>
		</div>
	)
}
