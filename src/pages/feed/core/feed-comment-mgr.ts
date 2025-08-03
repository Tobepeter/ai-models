import { useFeedStore } from '../feed-store'
import { feedMock } from './feed-mock'
import { feedConfig } from '../feed-config'
import { delayC } from '../../../utils/common'
import { CancelablePromise } from '../../../utils/cancelable-promise'
import { api } from '@/api/api'

/**
 * Feed评论管理器 - 专门处理评论相关逻辑
 */
class FeedCommentMgr {
	private commentTimer: Nullable<CancelablePromise> = null // 评论操作计时器
	mockMode = false

	private getStore() {
		return useFeedStore.getState()
	}

	// 清除评论计时器
	private clearCommentTimer() {
		if (this.commentTimer) {
			this.commentTimer.cancel()
			this.commentTimer = null
		}
	}

	// 清理所有计时器
	clearAllTimers() {
		this.clearCommentTimer()
	}

	// 添加评论 - 乐观更新
	async addComment(postId: string, content: string, replyTo?: string) {
		const store = this.getStore()

		try {
			if (this.mockMode) {
				this.clearCommentTimer()
				this.commentTimer = delayC(feedMock.getCommentDelay())
				await this.commentTimer

				const comment = feedMock.genComment(postId, content, replyTo)
				store.addComment(postId, comment)
				console.log(`[FeedCommentManager] Mock添加评论成功: ${postId}`)
			} else {
				// 调用真实API创建评论
				const response = await api.feed.createFeedComment(postId, {
					content,
					reply_to: replyTo,
				})

				if (response?.data) {
					// 转换后端数据为前端格式
					const comment = {
						...response.data,
						isLiked: false,
					}
					store.addComment(postId, comment)
					console.log(`[FeedCommentManager] 添加评论成功: ${postId}`)
				}
			}
		} catch (error) {
			console.error('[FeedCommentManager] 添加评论失败:', error)
		} finally {
			this.commentTimer = null
		}
	}

	// 初始化详情页评论
	async loadPostComments(postId: string) {
		const store = this.getStore()
		const post = store.posts.find((p) => p.id === postId)

		if (!post) {
			console.error('[FeedCommentManager] 帖子不存在:', postId)
			return
		}

		try {
			store.setPostCommentsLoading(postId, true)
			
			if (this.mockMode) {
				this.clearCommentTimer()
				this.commentTimer = delayC(feedMock.getCommentDelay())
				await this.commentTimer

				// Mock模式：基于预加载评论初始化
				const preloadedComments = post.preloaded_comments || []
				const hasMore = (post.comment_count || 0) > preloadedComments.length

				store.setPostDetailComments(postId, {
					loaded_comments: [...preloadedComments],
					next_cursor: (post as any).preloaded_comments_cursor,
					has_more: hasMore,
					loading: false,
				})
			} else {
				// 真实API：检查是否有预加载数据
				const preloadedComments = post.preloaded_comments || []
				
				if (preloadedComments.length > 0) {
					// 有预加载数据，基于预加载初始化
					const hasMore = (post.comment_count || 0) > preloadedComments.length
					store.setPostDetailComments(postId, {
						loaded_comments: [...preloadedComments],
						next_cursor: preloadedComments.length > 0 ? preloadedComments[preloadedComments.length - 1].id?.toString() : undefined,
						has_more: hasMore,
						loading: false,
					})
				} else {
					// 无预加载数据，全量加载评论
					const response = await api.feed.getFeedComments({ 
						postId: postId,
						post_id: postId,
						limit: feedConfig.commentPageSize 
					})
					
					if (response?.data) {
						const comments = (response.data.comments || []).map(c => ({ ...c, isLiked: false }))
						store.setPostDetailComments(postId, {
							loaded_comments: comments,
							next_cursor: response.data.next_cursor,
							has_more: response.data.has_more || false,
							loading: false,
						})
					}
				}
			}

			console.log(`[FeedCommentManager] 初始化详情页评论成功: ${postId}`)
		} catch (error) {
			console.error('[FeedCommentManager] 初始化详情页评论失败:', error)
			store.setPostCommentsError(postId, '加载评论失败')
		} finally {
			this.commentTimer = null
		}
	}

	// 加载更多评论
	async loadMoreComments(postId: string) {
		const store = this.getStore()
		const post = store.posts.find((p) => p.id === postId)

		if (!post?.detail_comments || post.detail_comments.loading) {
			return
		}

		try {
			store.setPostCommentsLoading(postId, true)
			
			if (this.mockMode) {
				this.clearCommentTimer()
				this.commentTimer = delayC(feedMock.getCommentDelay())
				await this.commentTimer

				// 使用mock生成分页数据
				const result = feedMock.genCommentPage(postId, post.detail_comments.next_cursor)
				store.appendPostComments(postId, result.comments, result.next_cursor, result.has_more)
			} else {
				// 调用真实API加载更多评论
				const response = await api.feed.getFeedComments({
					postId: postId,
					post_id: postId,
					after_id: post.detail_comments.next_cursor,
					limit: feedConfig.commentPageSize,
				})

				if (response?.data) {
					const comments = (response.data.comments || []).map(c => ({ ...c, isLiked: false }))
					store.appendPostComments(
						postId, 
						comments, 
						response.data.next_cursor, 
						response.data.has_more || false
					)
					console.log(`[FeedCommentManager] 加载更多评论成功: ${postId}, 新增${comments.length}条`)
				}
			}
		} catch (error) {
			console.error('[FeedCommentManager] 加载更多评论失败:', error)
			store.setPostCommentsError(postId, '加载更多评论失败')
		} finally {
			this.commentTimer = null
		}
	}

	// 清理详情页评论数据
	clearPostComments(postId: string) {
		this.getStore().clearPostDetailComments(postId)
	}
}

export const feedCommentMgr = new FeedCommentMgr()