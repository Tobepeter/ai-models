import { useFeedStore } from '../feed-store'
import { type AppFeedPost } from '../feed-types'
import { feedUtil } from './feed-util'
import { feedMock } from './feed-mock'
import { feedConfig } from './feed-config'
import { feedCommentMgr } from './feed-comment-mgr'
import { delayC } from '../../../utils/common'
import { CancelablePromise } from '../../../utils/cancelable-promise'
import { debounce } from 'lodash-es'
import { api } from '@/api/api'
import { useFeedDetailStore } from '../feed-detail-store'

/**
 * 信息流管理器
 */
class FeedMgr {
	private loadTimer: Nullable<CancelablePromise> = null // 数据加载计时器（初始化、加载更多、刷新）
	private likeTimer: Nullable<CancelablePromise> = null // 点赞操作计时器
	mockMode = false

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
				isLiked: item.is_liked ?? false, // 使用后端返回的状态，游客时默认false
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
	async refresh(): Promise<AppFeedPost[]> {
		const store = useFeedStore.getState()
		const isInitialLoad = store.posts.length === 0 // 判断是否为初始加载

		try {
			if (isInitialLoad) {
				store.setLoading(true) // 初始加载显示loading
			} else {
				store.setData({ refreshing: true, loading: true }) // 刷新显示refreshing状态
			}
			store.clearRefreshError()

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
			store.setRefreshError('刷新失败，请重试')
			store.setData({ refreshing: false, loading: false })
			return []
		} finally {
			this.loadTimer = null
		}
	}

	// 加载更多数据 - 用于无限滚动
	async loadMore() {
		const store = useFeedStore.getState()
		const { cursor, hasMore, loading } = store

		if (!hasMore || loading) return [] // 早期返回避免重复请求

		try {
			store.setLoading(true)
			store.clearLoadMoreError()

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
		} catch (error) {
			console.error('[feedMgr] 加载更多数据失败:', error)
			store.setLoadMoreError('加载失败，请重试')
			store.setLoading(false)
		} finally {
			this.loadTimer = null
		}
	}

	// 切换点赞状态
	toggleLike = debounce(
		async (postId: string) => {
			const store = useFeedStore.getState()

			// 乐观更新feed流
			store.toggleLike(postId)

			// 同步更新详情页（如果当前详情页是这个post）
			const detailStore = useFeedDetailStore.getState()
			if (detailStore.currPost?.id === postId) {
				detailStore.toggleCurrPostLike()
			}

			if (this.mockMode) {
				this.clearLikeTimer()
				this.likeTimer = delayC(feedMock.getLikeDelay())
				await this.likeTimer
				console.log(`[feedMgr] Mock切换点赞状态: ${postId}`)
			} else {
				const post = store.posts.find((p) => p.id === postId)
				const currentLiked = post?.is_liked || false
				// 静默更新
				api.feed.setFeedPostLike(postId, { is_like: !currentLiked }, { silent: true })
			}

			this.likeTimer = null
		},
		feedConfig.likeDebounceMs,
		{ leading: true, trailing: false }
	)

	toggleExpand(postId: string) {
		useFeedStore.getState().toggleExpand(postId) // 切换内容展开状态
	}

	// 设置mock模式
	setMockMode(enabled: boolean) {
		this.mockMode = enabled
		feedCommentMgr.mockMode = enabled // 同步评论管理器的mock模式
	}

	// 创建新的feed
	async createFeed(content: string, image?: string): Promise<AppFeedPost> {
		const store = useFeedStore.getState()

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
						isLiked: (response.data as any).is_liked ?? false, // 使用后端返回的状态，创建时通常为false
						isExpanded: false,
						preloaded_comments: [],
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
			store.setRefreshError('创建失败，请重试')
			throw error
		} finally {
			store.setLoading(false)
			this.loadTimer = null
		}
	}

	// 删除帖子
	async deletePost(postId: string) {
		const store = useFeedStore.getState()

		// 乐观删除
		store.deletePost(postId)

		// 同步删除详情页（如果当前详情页是这个post）
		const detailStore = useFeedDetailStore.getState()
		if (detailStore.currPost?.id === postId) {
			detailStore.closeDialog()
		}

		if (this.mockMode) {
			// Mock模式延迟
			await delayC(feedMock.getLoadMoreDelay())
			console.log(`[feedMgr] Mock删除feed成功: ${postId}`)
		} else {
			// 调用真实API删除
			await api.feed.deleteFeedPost(postId)
			console.log(`[feedMgr] 删除feed成功: ${postId}`)
		}
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
}

export const feedMgr = new FeedMgr()
