import { useFeedStore } from './feed-store'
import { type AppFeedPost } from './feed-types'
import { feedUtil } from './feed-util'
import { feedMock } from './feed-mock'
import { feedConfig } from './feed-config'
import { delayC } from '../../utils/common'
import { CancelablePromise } from '../../utils/cancelable-promise'
import { debounce } from 'lodash-es'
import { api } from '@/api/api'

/**
 * 信息流管理器 - 处理数据加载和状态管理
 */
class FeedManager {
	// 拆分为独立的计时器，避免不同业务操作相互干扰
	private loadTimer: Nullable<CancelablePromise> = null // 数据加载计时器（初始化、加载更多、刷新）
	private likeTimer: Nullable<CancelablePromise> = null // 点赞操作计时器
	private commentTimer: Nullable<CancelablePromise> = null // 评论操作计时器
	mockMode = false

	private getStore() {
		return useFeedStore.getState()
	}

	// 清除数据加载计时器
	private clearLoadTimer() {
		if (this.loadTimer) {
			this.loadTimer.cancel()
			this.loadTimer = null
		}
	}

	// 清除点赞计时器
	private clearLikeTimer() {
		if (this.likeTimer) {
			this.likeTimer.cancel()
			this.likeTimer = null
		}
	}

	// 清除评论计时器
	private clearCommentTimer() {
		if (this.commentTimer) {
			this.commentTimer.cancel()
			this.commentTimer = null
		}
	}

	// 清除所有计时器
	clearAllTimers() {
		this.clearLoadTimer()
		this.clearLikeTimer()
		this.clearCommentTimer()
	}

	// 通用Feed加载方法 - 支持初始加载/刷新/加载更多
	private async getFeedPosts(cursor?: string): Promise<{ posts: AppFeedPost[]; cursor: string | null; hasMore: boolean }> {
		if (this.mockMode) {
			// Mock模式逻辑
			await delayC(feedMock.getInitDelay())
			const posts = feedMock.genPosts(cursor ? feedConfig.feedPageSize : feedConfig.feedPageSize)
			return {
				posts,
				cursor: posts.length > 0 ? feedUtil.genMockCursor() : null,
				hasMore: posts.length >= feedConfig.feedPageSize
			}
		} else {
			// 真实API调用
			const response = await api.feed.getFeedPosts({
				after_id: cursor,
				limit: feedConfig.feedPageSize,
				comment_count: feedConfig.commentPageSize,
			})
			
			if (!response?.data?.posts) {
				return { posts: [], cursor: null, hasMore: false }
			}
			
			// 转换后端数据为前端格式
			const posts = response.data.posts.map(item => ({
				...item,
				isLiked: false, // TODO: 从后端获取用户点赞状态
				isExpanded: false,
			}))

			return {
				posts,
				cursor: response.data.next_cursor || null,
				hasMore: response.data.has_more || false
			}
		}
	}

	// 初始化加载信息流数据
	async loadInitial(): Promise<AppFeedPost[]> {
		const store = this.getStore()

		try {
			store.setLoading(true)
			store.clearError()

			this.clearLoadTimer()
			this.loadTimer = delayC(100) // 最小延迟保证loading状态显示
			await this.loadTimer

			const result = await this.getFeedPosts()

			store.setData({ 
				posts: result.posts, 
				cursor: result.cursor, 
				hasMore: result.hasMore, 
				loading: false 
			})
			return result.posts
		} catch (error) {
			console.error('[FeedManager] 加载初始数据失败:', error)
			store.setError('加载失败，请重试')
			store.setLoading(false)
			return []
		} finally {
			this.loadTimer = null
		}
	}

	// 加载更多数据 - 用于无限滚动
	async loadMore(): Promise<AppFeedPost[]> {
		const store = this.getStore()
		const { cursor, hasMore, loading } = store

		if (!hasMore || loading) return [] // 早期返回避免重复请求

		try {
			store.setLoading(true)
			store.clearError()

			this.clearLoadTimer()
			this.loadTimer = delayC(100) // 最小延迟
			await this.loadTimer

			const result = await this.getFeedPosts(cursor || undefined)

			if (result.posts.length === 0) {
				store.setData({ hasMore: false, loading: false })
				return []
			}

			store.appendPosts(result.posts)
			store.setData({
				cursor: result.cursor,
				hasMore: result.hasMore,
				loading: false,
			})

			return result.posts
		} catch (error) {
			console.error('[FeedManager] 加载更多数据失败:', error)
			store.setError('加载失败，请重试')
			store.setLoading(false)
			return []
		} finally {
			this.loadTimer = null
		}
	}

	// 下拉刷新数据
	async refresh(): Promise<AppFeedPost[]> {
		const store = this.getStore()

		try {
			store.setData({ refreshing: true, loading: true })
			store.clearError()

			this.clearLoadTimer()
			this.loadTimer = delayC(100) // 最小延迟
			await this.loadTimer

			const result = await this.getFeedPosts() // 不传cursor，获取最新数据

			store.setData({ 
				posts: result.posts, 
				cursor: result.cursor, 
				hasMore: result.hasMore, 
				refreshing: false, 
				loading: false 
			})
			return result.posts
		} catch (error) {
			console.error('[FeedManager] 刷新数据失败:', error)
			store.setError('刷新失败，请重试')
			store.setData({ refreshing: false, loading: false })
			return []
		} finally {
			this.loadTimer = null
		}
	}

	// 切换点赞状态
	toggleLike = debounce(
		async (postId: string) => {
			const store = this.getStore()

			try {
				store.toggleLike(postId) // 乐观更新
				
				if (this.mockMode) {
					this.clearLikeTimer()
					this.likeTimer = delayC(feedMock.getLikeDelay())
					await this.likeTimer
					console.log(`[FeedManager] Mock切换点赞状态: ${postId}`)
				} else {
					// 调用真实API
					const post = store.posts.find(p => p.id === postId)
					const currentLiked = post?.isLiked || false
					await api.feed.setFeedPostLike(postId, { is_like: !currentLiked })
					console.log(`[FeedManager] 切换点赞状态: ${postId}`)
				}
			} catch (error) {
				console.error('[FeedManager] 切换点赞失败:', error)
				store.toggleLike(postId) // 失败时回滚
			} finally {
				this.likeTimer = null
			}
		},
		150,
		{ leading: true, trailing: false }
	)

	toggleExpand(postId: string) {
		this.getStore().toggleExpand(postId) // 切换内容展开状态
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
				console.log(`[FeedManager] Mock添加评论成功: ${postId}`)
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
					console.log(`[FeedManager] 添加评论成功: ${postId}`)
				}
			}
		} catch (error) {
			console.error('[FeedManager] 添加评论失败:', error)
		} finally {
			this.commentTimer = null
		}
	}

	// 初始化详情页评论 - 基于预加载数据或全量加载
	async loadPostComments(postId: string) {
		const store = this.getStore()
		const post = store.posts.find((p) => p.id === postId)

		if (!post) {
			console.error('[FeedManager] 帖子不存在:', postId)
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

			console.log(`[FeedManager] 初始化详情页评论成功: ${postId}`)
		} catch (error) {
			console.error('[FeedManager] 初始化详情页评论失败:', error)
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
				console.log(`[FeedManager] Mock加载更多评论成功: ${postId}, 新增${result.comments.length}条`)
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
					console.log(`[FeedManager] 加载更多评论成功: ${postId}, 新增${comments.length}条`)
				}
			}
		} catch (error) {
			console.error('[FeedManager] 加载更多评论失败:', error)
			store.setPostCommentsError(postId, '加载更多评论失败')
		} finally {
			this.commentTimer = null
		}
	}

	// 清理详情页评论数据
	clearPostComments(postId: string) {
		this.getStore().clearPostDetailComments(postId)
	}

	// 创建新的feed
	async createFeed(content: string, image?: string): Promise<AppFeedPost> {
		const store = this.getStore()

		try {
			store.setLoading(true)

			if (this.mockMode) {
				// Mock模式
				this.clearLoadTimer()
				this.loadTimer = delayC(feedMock.getLoadMoreDelay())
				await this.loadTimer

				const newPost = feedMock.createUserPost(content, image)
				store.addNewPost(newPost)
				console.log(`[FeedManager] Mock创建feed成功: ${newPost.id}`)
				return newPost
			} else {
				// 调用真实API创建feed
				const response = await api.feed.createFeedPost({
					content,
					image_url: image,
				})

				if (response?.data) {
					// 转换后端数据为前端格式
					const newPost = {
						...response.data,
						isLiked: false,
						isExpanded: false,
						preloaded_comments: [],
						comment_preview_count: 0,
					}
					store.addNewPost(newPost)
					console.log(`[FeedManager] 创建feed成功: ${newPost.id}`)
					return newPost
				} else {
					throw new Error('创建失败')
				}
			}
		} catch (error) {
			console.error('[FeedManager] 创建feed失败:', error)
			store.setError('创建失败，请重试')
			throw error
		} finally {
			store.setLoading(false)
			this.loadTimer = null
		}
	}
}

export const feedMgr = new FeedManager() // 更新游标为新的最后一条 // 解析游标获取时间基准点
