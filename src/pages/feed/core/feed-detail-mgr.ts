import { useFeedDetailStore } from '../feed-detail-store'
import { useFeedStore } from '../feed-store'
import { feedMock } from './feed-mock'
import { feedConfig } from './feed-config'
import { feedUtil } from './feed-util'
import { delayC } from '../../../utils/common'
import { CancelablePromise } from '../../../utils/cancelable-promise'
import { api } from '@/api/api'
import type { AppFeedPost, AppFeedComment } from '../feed-types'
import type { FeedPost } from '@/api/swagger/generated'

/**
 * Feed详情页管理器
 */
class FeedDetailMgr {
	private loadTimer: Nullable<CancelablePromise> = null
	private commentTimer: Nullable<CancelablePromise> = null
	mockMode = false

	private getDetailStore() {
		return useFeedDetailStore.getState()
	}

	private getFeedStore() {
		return useFeedStore.getState()
	}

	// 清除所有计时器
	clearAllTimers() {
		if (this.loadTimer) {
			this.loadTimer.cancel()
			this.loadTimer = null
		}
		if (this.commentTimer) {
			this.commentTimer.cancel()
			this.commentTimer = null
		}
	}

	// 转换FeedPost为AppFeedPost类型
	private convertFeedPostToAppFeedPost(feedPost: FeedPost): AppFeedPost {
		return {
			...feedPost,
			preloaded_comments: [], // FeedPost没有预载评论，设为空数组
			comment_preview_count: 0, // 预载评论数量设为0
			is_liked: undefined, // 详情API可能不返回用户点赞状态
		}
	}

	// 打开弹窗详情页
	async openDialog(postId: string) {
		const detailStore = this.getDetailStore()
		const feedStore = this.getFeedStore()

		// 从feed流中获取post数据作为初始数据
		const feedPost = feedStore.posts.find(p => p.id === postId)
		
		// 打开弹窗并设置初始数据
		detailStore.openDialog(postId, feedPost || null)

		// 初始化评论数据
		if (feedPost) {
			await this.initComments(postId, feedPost)
		} else {
			// 如果feed流中没有数据，加载完整post数据
			await this.loadPostDetail(postId)
		}
	}

	// 进入详情页（独立页面）
	async enterPage(postId: string) {
		const detailStore = this.getDetailStore()
		const feedStore = this.getFeedStore()

		detailStore.setLoading(true)
		detailStore.clearError()

		try {
			// 从feed流中获取post数据作为初始数据
			const feedPost = feedStore.posts.find(p => p.id === postId)
			
			if (feedPost) {
				// 使用feed流中的数据初始化
				detailStore.setCurrentPost(feedPost)
				await this.initComments(postId, feedPost)
			} else {
				// 加载完整post数据
				await this.loadPostDetail(postId)
			}
		} catch (error) {
			console.error('[FeedDetailMgr] 进入详情页失败:', error)
			detailStore.setError('加载详情页失败')
		} finally {
			detailStore.setLoading(false)
		}
	}

	// 加载单个post详情
	async loadPostDetail(postId: string) {
		const detailStore = this.getDetailStore()

		try {
			if (this.mockMode) {
				this.clearLoadTimer()
				this.loadTimer = delayC(feedMock.getRefreshDelay())
				await this.loadTimer

				// Mock模式：生成post详情
				const mockPost = feedMock.genSinglePost()
				detailStore.setCurrentPost(mockPost)
				await this.initComments(postId, mockPost)
			} else {
				// 调用真实API获取post详情
				const response = await api.feed.getFeedPostDetail(postId)
				if (response?.data) {
					// 转换FeedPost为AppFeedPost (FeedPostResponseItem)
					const feedPost = this.convertFeedPostToAppFeedPost(response.data)
					detailStore.setCurrentPost(feedPost)
					await this.initComments(postId, feedPost)
				} else {
					detailStore.setError('无法加载帖子详情')
				}
			}
		} catch (error) {
			console.error('[FeedDetailMgr] 加载post详情失败:', error)
			detailStore.setError('加载失败')
		} finally {
			this.loadTimer = null
		}
	}

	// 初始化评论数据
	async initComments(postId: string, post: AppFeedPost) {
		const detailStore = this.getDetailStore()
		
		try {
			detailStore.setCommentsLoading(true)

			if (this.mockMode) {
				this.clearCommentTimer()
				this.commentTimer = delayC(feedMock.getCommentDelay())
				await this.commentTimer

				// Mock模式：基于预加载评论初始化
				const preloadedComments = post.preloaded_comments || []
				const hasMore = (post.comment_count || 0) > preloadedComments.length

				detailStore.initComments(
					preloadedComments,
					(post as any).preloaded_comments_cursor,
					hasMore
				)
			} else {
				// 真实API：检查是否有预加载数据
				const preloadedComments = post.preloaded_comments || []
				
				if (preloadedComments.length > 0) {
					// 有预加载数据，基于预加载初始化
					const hasMore = (post.comment_count || 0) > preloadedComments.length
					detailStore.initComments(
						preloadedComments,
						preloadedComments.length > 0 ? preloadedComments[preloadedComments.length - 1].id?.toString() : undefined,
						hasMore
					)
				} else {
					// 无预加载数据，全量加载评论
					const response = await api.feed.getFeedComments({ 
						postId: postId,
						post_id: postId,
						limit: feedConfig.commentPageSize 
					})
					
					if (response?.data) {
						const comments = (response.data.comments || []).map(c => ({ ...c, isLiked: false }))
						detailStore.initComments(
							comments,
							response.data.next_cursor,
							response.data.has_more || false
						)
					}
				}
			}

			console.log(`[FeedDetailMgr] 初始化评论成功: ${postId}`)
		} catch (error) {
			console.error('[FeedDetailMgr] 初始化评论失败:', error)
			detailStore.setCommentsError('加载评论失败')
		} finally {
			this.commentTimer = null
		}
	}

	// 加载更多评论
	async loadMoreComments() {
		const detailStore = this.getDetailStore()
		const { currentPost, commentState } = detailStore
		
		if (!currentPost || commentState.loading || !commentState.hasMore) {
			return
		}

		try {
			detailStore.setCommentsLoading(true)
			
			if (this.mockMode) {
				this.clearCommentTimer()
				this.commentTimer = delayC(feedMock.getCommentDelay())
				await this.commentTimer

				// Mock模式：生成分页数据
				const result = feedMock.genCommentPage(currentPost.id!, commentState.cursor)
				detailStore.appendComments(result.comments, result.next_cursor, result.has_more)
			} else {
				// 调用真实API加载更多评论
				const response = await api.feed.getFeedComments({
					postId: currentPost.id!,
					post_id: currentPost.id!,
					after_id: commentState.cursor,
					limit: feedConfig.commentPageSize,
				})

				if (response?.data) {
					const comments = (response.data.comments || []).map(c => ({ ...c, isLiked: false }))
					detailStore.appendComments(
						comments, 
						response.data.next_cursor, 
						response.data.has_more || false
					)
					console.log(`[FeedDetailMgr] 加载更多评论成功: ${currentPost.id}, 新增${comments.length}条`)
				}
			}
		} catch (error) {
			console.error('[FeedDetailMgr] 加载更多评论失败:', error)
			detailStore.setCommentsError('加载更多评论失败')
		} finally {
			this.commentTimer = null
		}
	}

	// 添加评论 - 乐观更新 + 同步到主页
	async addComment(content: string, replyTo?: string) {
		const detailStore = this.getDetailStore()
		const feedStore = this.getFeedStore()
		const { currentPost } = detailStore

		if (!currentPost?.id) {
			console.error('[FeedDetailMgr] 当前post不存在，无法添加评论')
			return
		}

		try {
			if (this.mockMode) {
				this.clearCommentTimer()
				this.commentTimer = delayC(feedMock.getCommentDelay())
				await this.commentTimer

				const comment = feedMock.genComment(currentPost.id, content, replyTo)
				
				// 乐观更新详情页
				detailStore.addComment(comment)
				
				// 同步到主页feed流
				feedStore.addComment(currentPost.id, comment)
				
				console.log(`[FeedDetailMgr] Mock添加评论成功: ${currentPost.id}`)
			} else {
				// 调用真实API创建评论
				const response = await api.feed.createFeedComment(currentPost.id, {
					content,
					reply_to: replyTo,
				})

				if (response?.data) {
					const comment = {
						...response.data,
						isLiked: false,
					}
					
					// 乐观更新详情页
					detailStore.addComment(comment)
					
					// 同步到主页feed流
					feedStore.addComment(currentPost.id, comment)
					
					console.log(`[FeedDetailMgr] 添加评论成功: ${currentPost.id}`)
				}
			}
		} catch (error) {
			console.error('[FeedDetailMgr] 添加评论失败:', error)
		} finally {
			this.commentTimer = null
		}
	}

	// 切换点赞状态 - 同步到主页
	async toggleLike() {
		const detailStore = this.getDetailStore()
		const feedStore = this.getFeedStore()
		const { currentPost } = detailStore

		if (!currentPost?.id) {
			console.error('[FeedDetailMgr] 当前post不存在，无法点赞')
			return
		}

		try {
			// 乐观更新详情页
			detailStore.toggleCurrentPostLike()
			
			// 同步到主页feed流
			feedStore.toggleLike(currentPost.id)

			// TODO: 调用真实API
			// if (!this.mockMode) {
			//   await api.feed.toggleLike(currentPost.id)
			// }

			console.log(`[FeedDetailMgr] 切换点赞状态: ${currentPost.id}`)
		} catch (error) {
			console.error('[FeedDetailMgr] 切换点赞失败:', error)
			// 回滚操作
			detailStore.toggleCurrentPostLike()
			feedStore.toggleLike(currentPost.id!)
		}
	}

	// 关闭详情页
	closeDetail() {
		const detailStore = this.getDetailStore()
		this.clearAllTimers()
		detailStore.reset()
	}

	// 清除加载计时器
	private clearLoadTimer() {
		if (this.loadTimer) {
			this.loadTimer.cancel()
			this.loadTimer = null
		}
	}

	// 清除评论计时器
	private clearCommentTimer() {
		if (this.commentTimer) {
			this.commentTimer.cancel()
			this.commentTimer = null
		}
	}
}

export const feedDetailMgr = new FeedDetailMgr()