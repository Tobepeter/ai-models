import { useMemo } from 'react'
import { useFeedStore } from '../feed-store'
import { feedUtil } from '../feed-util'
import { type FeedPost, type FeedComment } from '../feed-types'

/**
 * Feed详情页面逻辑Hook
 */
export const useFeedDetail = (post: FeedPost) => {
	const { commentsByPostId, setPostComments, toggleLike, toggleExpand, detailDialog } = useFeedStore()

	// 获取评论数据
	const commentPage = commentsByPostId[post.id]
	const comments = useMemo(() => {
		if (!commentPage) {
			// 如果没有分页数据，直接使用 post 中的评论
			return post.comments || []
		}
		return commentPage.comments.map((id) => commentPage.commentsById[id]).filter(Boolean)
	}, [commentPage, post.comments])

	const hasMoreComments = Boolean(commentPage?.nextCursor || (commentPage?.total || 0) > comments.length)

	// 处理点赞
	const handleLike = (postId: string) => {
		toggleLike(postId)
	}

	// 处理展开
	const handleToggleExpand = (postId: string) => {
		toggleExpand(postId)
	}

	// 加载更多评论
	const handleLoadMore = async () => {
		if (!commentPage || commentPage.loading) return

		// TODO: 调用 manager 加载更多评论
		console.log('加载更多评论:', post.id, commentPage.nextCursor)
	}

	// 重试加载
	const handleRetry = () => {
		handleLoadMore()
	}

	// 生成新评论
	const createComment = (content: string, replyTo?: string): FeedComment => feedUtil.createComment(post.id, content, replyTo)

	return {
		// 数据
		comments,
		commentPage,
		hasMoreComments,

		// 处理函数
		handleLike,
		handleToggleExpand,
		handleLoadMore,
		handleRetry,
		createComment,

		// 状态
		loading: commentPage?.loading || false,
		error: commentPage?.error,
	}
}
