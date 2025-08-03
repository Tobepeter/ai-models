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
			is_liked: undefined, // 详情API可能不返回用户点赞状态
		}
	}

	// 统一的数据加载方法 - 供组件直接调用
	async loadPostData(postId: string) {
		const detailStore = useFeedDetailStore.getState()
		const feedStore = useFeedStore.getState()

		try {
			detailStore.setLoading(true)
			detailStore.clearError()

			// 检查 feedStore 中是否有缓存
			const feedPost = feedStore.posts.find((p) => p.id === postId)

			if (feedPost) {
				// 有缓存，使用缓存数据并初始化评论
				detailStore.setCurrPost(feedPost)
				await this.initComments(postId, feedPost)
			} else {
				// 没有缓存，加载完整 post 数据
				await this.loadPostDetail(postId)
			}
		} catch (error) {
			console.error('[FeedDetailMgr] 加载post数据失败:', error)
			detailStore.setError('加载详情失败')
		} finally {
			detailStore.setLoading(false)
		}
	}

	// 打开弹窗详情页 - 简化版
	async openDialog(postId: string) {
		const detailStore = useFeedDetailStore.getState()

		// 直接打开弹窗，数据加载由 FeedDetailContent 组件处理
		detailStore.openDialog(postId, null)
	}

	// 进入详情页（独立页面） - 简化版
	async enterPage(postId: string) {
		await this.loadPostData(postId)
	}

	// 加载单个post详情
	async loadPostDetail(postId: string) {
		const detailStore = useFeedDetailStore.getState()

		try {
			if (this.mockMode) {
				this.clearLoadTimer()
				this.loadTimer = delayC(feedMock.getRefreshDelay())
				await this.loadTimer

				const mockPost = feedMock.genSinglePost() // Mock模式：生成post详情
				detailStore.setCurrPost(mockPost)
				await this.initComments(postId, mockPost)
			} else {
				const response = await api.feed.getFeedPostDetail(postId) // 调用真实API获取post详情
				if (response?.data) {
					const feedPost = this.convertFeedPostToAppFeedPost(response.data) // 转换FeedPost为AppFeedPost (FeedPostResponseItem)
					detailStore.setCurrPost(feedPost)
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
		const detailStore = useFeedDetailStore.getState()

		try {
			detailStore.setCommentsLoading(true)

			if (this.mockMode) {
				this.clearCommentTimer()
				this.commentTimer = delayC(feedMock.getCommentDelay())
				await this.commentTimer

				const preloadedComments = post.preloaded_comments || [] // Mock模式：基于预加载评论初始化
				const hasMore = (post.comment_count || 0) > preloadedComments.length

				detailStore.initComments(preloadedComments, (post as any).preloaded_comments_cursor, hasMore)
			} else {
				const preloadedComments = post.preloaded_comments || [] // 真实API：检查是否有预加载数据

				if (preloadedComments.length > 0) {
					const hasMore = (post.comment_count || 0) > preloadedComments.length // 有预加载数据，基于预加载初始化
					detailStore.initComments(preloadedComments, post.preloaded_comments_next_cursor, hasMore)
				} else {
					const resp = await api.feed.getFeedComments({
						// 无预加载数据，全量加载评论
						postId: postId,
						post_id: postId,
						limit: feedConfig.commentPageSize,
					})

					if (resp?.data) {
						const comments = (resp.data.comments || []).map((c) => ({ ...c, isLiked: false }))
						detailStore.initComments(comments, resp.data.next_cursor, resp.data.has_more || false)
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
		const detailStore = useFeedDetailStore.getState()
		const { currPost, commentsCursor, commentsHasMore, commentsLoading } = detailStore

		if (!currPost || commentsLoading || !commentsHasMore) return

		try {
			detailStore.setCommentsLoading(true)

			if (this.mockMode) {
				this.clearCommentTimer()
				this.commentTimer = delayC(feedMock.getCommentDelay())
				await this.commentTimer

				const result = feedMock.genCommentPage(currPost.id!, commentsCursor) // Mock模式：生成分页数据
				detailStore.appendComments(result.comments, result.next_cursor, result.has_more)
			} else {
				const response = await api.feed.getFeedComments({
					// 调用真实API加载更多评论
					postId: currPost.id!,
					post_id: currPost.id!,
					after_id: commentsCursor,
					limit: feedConfig.commentPageSize,
				})

				if (response?.data) {
					const comments = (response.data.comments || []).map((c) => ({ ...c, isLiked: false }))
					detailStore.appendComments(comments, response.data.next_cursor, response.data.has_more || false)
					console.log(`[FeedDetailMgr] 加载更多评论成功: ${currPost.id}, 新增${comments.length}条`)
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
		const detailStore = useFeedDetailStore.getState()
		const feedStore = useFeedStore.getState()
		const { currPost } = detailStore

		if (!currPost?.id) {
			console.error('[FeedDetailMgr] 当前post不存在，无法添加评论')
			return
		}

		try {
			if (this.mockMode) {
				this.clearCommentTimer()
				this.commentTimer = delayC(feedMock.getCommentDelay())
				await this.commentTimer

				const comment = feedMock.genComment(currPost.id, content, replyTo)

				detailStore.addComment(comment) // 乐观更新详情页
				feedStore.addComment(currPost.id, comment) // 同步到主页feed流

				console.log(`[FeedDetailMgr] Mock添加评论成功: ${currPost.id}`)
			} else {
				const response = await api.feed.createFeedComment(currPost.id, {
					// 调用真实API创建评论
					content,
					reply_to: replyTo,
				})

				if (response?.data) {
					const comment = {
						...response.data,
						isLiked: false,
					}

					detailStore.addComment(comment) // 乐观更新详情页
					feedStore.addComment(currPost.id, comment) // 同步到主页feed流

					console.log(`[FeedDetailMgr] 添加评论成功: ${currPost.id}`)
				}
			}
		} catch (error) {
			console.error('[FeedDetailMgr] 添加评论失败:', error)
		} finally {
			this.commentTimer = null
		}
	}

	// 切换点赞状态 - 委托给feedMgr统一处理
	async toggleLike() {
		const { currPost } = useFeedDetailStore.getState()

		if (!currPost?.id) {
			console.error('[FeedDetailMgr] 当前post不存在，无法点赞')
			return
		}

		const { feedMgr } = await import('./feed-mgr') // 委托给feedMgr统一处理，会自动同步feed流和详情页
		feedMgr.toggleLike(currPost.id)
	}

	// 关闭详情页
	closeDetail() {
		const detailStore = useFeedDetailStore.getState()
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
