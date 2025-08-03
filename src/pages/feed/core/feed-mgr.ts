import { useFeedStore } from '../feed-store'
import { type AppFeedPost } from '../feed-types'
import { feedUtil } from './feed-util'
import { feedMock } from './feed-mock'
import { feedConfig } from '../feed-config'
import { feedCommentMgr } from './feed-comment-mgr'
import { delayC } from '../../../utils/common'
import { CancelablePromise } from '../../../utils/cancelable-promise'
import { debounce } from 'lodash-es'
import { api } from '@/api/api'

/**
 * 信息流管理器
 */
class FeedMgr {
	private loadTimer: Nullable<CancelablePromise> = null // 数据加载计时器（初始化、加载更多、刷新）
	private likeTimer: Nullable<CancelablePromise> = null // 点赞操作计时器
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

	// 清除所有计时器
	clearAllTimers() {
		this.clearLoadTimer()
		this.clearLikeTimer()
		feedCommentMgr.clearAllTimers() // 清理评论管理器的计时器
	}

	// 通用Feed加载方法 - 支持初始加载/刷新/加载更多
	private async getFeedPosts(cursor?: string): Promise<{ posts: AppFeedPost[]; cursor: string; hasMore: boolean }> {
		if (this.mockMode) {
			// Mock模式逻辑
			await delayC(feedMock.getRefreshDelay())
			const posts = feedMock.genPosts(cursor ? feedConfig.feedPageSize : feedConfig.feedPageSize)
			return {
				posts,
				cursor: posts.length > 0 ? feedUtil.genMockCursor() : '',
				hasMore: posts.length >= feedConfig.feedPageSize,
			}
		} else {
			// 真实API调用
			const response = await api.feed.getFeedPosts({
				after_id: cursor,
				limit: feedConfig.feedPageSize,
				comment_count: feedConfig.commentPageSize,
			})

			if (!response?.data?.posts) {
				return { posts: [], cursor: '', hasMore: false }
			}

			// 转换后端数据为前端格式
			const posts = response.data.posts.map((item) => ({
				...item,
				isLiked: false, // TODO: 从后端获取用户点赞状态
				isExpanded: false,
			}))

			return {
				posts,
				cursor: response.data.next_cursor || '',
				hasMore: response.data.has_more || false,
			}
		}
	}

	// 刷新数据 - 支持初始加载和下拉刷新
	async refresh(showRefreshing = false): Promise<AppFeedPost[]> {
		const store = this.getStore()

		try {
			if (showRefreshing) {
				store.setData({ refreshing: true, loading: true })
			} else {
				store.setLoading(true)
			}
			store.clearError()

			this.clearLoadTimer()
			this.loadTimer = delayC(100) // 最小延迟保证loading状态显示
			await this.loadTimer

			const result = await this.getFeedPosts() // 不传cursor，获取最新数据

			store.setData({
				posts: result.posts,
				cursor: result.cursor,
				hasMore: result.hasMore,
				refreshing: false,
				loading: false,
			})
			return result.posts
		} catch (error) {
			console.error('[feedMgr] 刷新数据失败:', error)
			store.setError('刷新失败，请重试')
			store.setData({ refreshing: false, loading: false })
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

			const result = await this.getFeedPosts(cursor || '')

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
			console.error('[feedMgr] 加载更多数据失败:', error)
			store.setError('加载失败，请重试')
			store.setLoading(false)
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
					console.log(`[feedMgr] Mock切换点赞状态: ${postId}`)
				} else {
					// 调用真实API
					const post = store.posts.find((p) => p.id === postId)
					const currentLiked = post?.isLiked || false
					await api.feed.setFeedPostLike(postId, { is_like: !currentLiked })
					console.log(`[feedMgr] 切换点赞状态: ${postId}`)
				}
			} catch (error) {
				console.error('[feedMgr] 切换点赞失败:', error)
				store.toggleLike(postId) // 失败时回滚
			} finally {
				this.likeTimer = null
			}
		},
		feedConfig.likeDebounceMs,
		{ leading: true, trailing: false }
	)

	toggleExpand(postId: string) {
		this.getStore().toggleExpand(postId) // 切换内容展开状态
	}

	// 设置mock模式
	setMockMode(enabled: boolean) {
		this.mockMode = enabled
		feedCommentMgr.mockMode = enabled // 同步评论管理器的mock模式
	}

	// 代理评论相关方法到评论管理器
	async addComment(postId: string, content: string, replyTo?: string) {
		return feedCommentMgr.addComment(postId, content, replyTo)
	}

	async loadPostComments(postId: string) {
		return feedCommentMgr.loadPostComments(postId)
	}

	async loadMoreComments(postId: string) {
		return feedCommentMgr.loadMoreComments(postId)
	}

	clearPostComments(postId: string) {
		return feedCommentMgr.clearPostComments(postId)
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
				console.log(`[feedMgr] Mock创建feed成功: ${newPost.id}`)
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
					console.log(`[feedMgr] 创建feed成功: ${newPost.id}`)
					return newPost
				} else {
					throw new Error('创建失败')
				}
			}
		} catch (error) {
			console.error('[feedMgr] 创建feed失败:', error)
			store.setError('创建失败，请重试')
			throw error
		} finally {
			store.setLoading(false)
			this.loadTimer = null
		}
	}
}

export const feedMgr = new FeedMgr()
