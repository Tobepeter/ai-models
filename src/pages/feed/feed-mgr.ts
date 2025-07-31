import { useFeedStore } from './feed-store'
import { type FeedPost } from './feed-types'
import { feedUtil } from './feed-util'
import { feedMock } from './feed-mock'
import { delayC } from '../../utils/common'
import { CancelablePromise } from '../../utils/cancelable-promise'
import { Nullable } from '../../utils/types'
import { faker } from '@faker-js/faker'
import { debounce } from 'lodash-es'

/**
 * 信息流管理器 - 处理数据加载和状态管理
 * 支持无限滚动、下拉刷新、点赞和评论等功能
 */
class FeedManager {
	// 拆分为独立的计时器，避免不同业务操作相互干扰
	private loadTimer: Nullable<CancelablePromise> = null      // 数据加载计时器（初始化、加载更多、刷新）
	private likeTimer: Nullable<CancelablePromise> = null      // 点赞操作计时器
	private commentTimer: Nullable<CancelablePromise> = null   // 评论操作计时器

	private getStore() {
		return useFeedStore.getState()
	}

	/* 清除数据加载计时器 */
	private clearLoadTimer() {
		if (this.loadTimer) {
			this.loadTimer.cancel()
			this.loadTimer = null
		}
	}

	/* 清除点赞计时器 */
	private clearLikeTimer() {
		if (this.likeTimer) {
			this.likeTimer.cancel()
			this.likeTimer = null
		}
	}

	/* 清除评论计时器 */
	private clearCommentTimer() {
		if (this.commentTimer) {
			this.commentTimer.cancel()
			this.commentTimer = null
		}
	}

	/* 清除所有计时器 - 用于组件卸载等场景 */
	clearAllTimers() {
		this.clearLoadTimer()
		this.clearLikeTimer()
		this.clearCommentTimer()
	}

	/* 初始化加载信息流数据 */
	async loadInitial(): Promise<FeedPost[]> {
		const store = this.getStore()

		try {
			store.setLoading(true)
			store.clearError()

			this.clearLoadTimer()
			this.loadTimer = delayC(faker.number.int({ min: 800, max: 1200 }))
			await this.loadTimer

			const posts = feedMock.generateMockPosts(20)

			const lastPost = posts[posts.length - 1]
			const cursor = lastPost ? feedUtil.generateCursor(new Date(lastPost.createdAt).getTime(), lastPost.id) : null

			store.setData({ posts, cursor, hasMore: true, loading: false })
			return posts
		} catch (error) {
			console.error('[FeedManager] 加载初始数据失败:', error)
			store.setError('加载失败，请重试')
			store.setLoading(false)
			return []
		} finally {
			this.loadTimer = null
		}
	}

	/* 加载更多数据 - 用于无限滚动 */
	async loadMore(): Promise<FeedPost[]> {
		const store = this.getStore()
		const { cursor, hasMore, loading } = store

		if (!hasMore || loading) return [] // 早期返回避免重复请求

		try {
			store.setLoading(true)
			store.clearError()

			this.clearLoadTimer()
			this.loadTimer = delayC(faker.number.int({ min: 500, max: 1000 }))
			await this.loadTimer

			let beforeTimestamp = Date.now()
			if (cursor) {
				const parsed = feedUtil.parseCursor(cursor)
				if (parsed) beforeTimestamp = parsed.timestamp
			}

			const posts = feedMock.generateMockPosts(15, beforeTimestamp) // 生成更早的数据

			if (posts.length === 0) {
				store.setData({ hasMore: false, loading: false })
				return []
			}

			const lastPost = posts[posts.length - 1]
			const newCursor = feedUtil.generateCursor(new Date(lastPost.createdAt).getTime(), lastPost.id)

			store.appendPosts(posts)
			store.setData({
				cursor: newCursor,
				hasMore: posts.length >= 15, // 数据不足说明已经没有更多
				loading: false,
			})

			return posts
		} catch (error) {
			console.error('[FeedManager] 加载更多数据失败:', error)
			store.setError('加载失败，请重试')
			store.setLoading(false)
			return []
		} finally {
			this.loadTimer = null
		}
	} // 设置分页游标为最后一条数据的时间戳

	/* 下拉刷新数据 */
	async refresh(): Promise<FeedPost[]> {
		const store = this.getStore()

		try {
			store.setData({ refreshing: true, loading: true })
			store.clearError()

			this.clearLoadTimer()
			this.loadTimer = delayC(faker.number.int({ min: 800, max: 1200 }))
			await this.loadTimer

			const posts = feedMock.generateMockPosts(10) // 生成新的数据

			const lastPost = posts[posts.length - 1]
			const cursor = lastPost ? feedUtil.generateCursor(new Date(lastPost.createdAt).getTime(), lastPost.id) : null

			store.setData({ posts, cursor, hasMore: true, refreshing: false, loading: false })
			return posts
		} catch (error) {
			console.error('[FeedManager] 刷新数据失败:', error)
			store.setError('刷新失败，请重试')
			store.setData({ refreshing: false, loading: false })
			return []
		} finally {
			this.loadTimer = null
		}
	}

	/* 切换点赞状态 */
	toggleLike = debounce(async (postId: string) => {
		const store = this.getStore()

		try {
			store.toggleLike(postId) // 乐观更新
			this.clearLikeTimer()
			this.likeTimer = delayC(faker.number.int({ min: 200, max: 500 }))
			await this.likeTimer
			console.log(`[FeedManager] 切换点赞状态: ${postId}`)
		} catch (error) {
			console.error('[FeedManager] 切换点赞失败:', error)
			store.toggleLike(postId) // 失败时回滚
		} finally {
			this.likeTimer = null
		}
	}, 150, { leading: true, trailing: false })

	toggleExpand(postId: string) {
		this.getStore().toggleExpand(postId) // 切换内容展开状态
	}

	/* 添加评论 */
	async addComment(postId: string, content: string, replyTo?: string) {
		const store = this.getStore()

		try {
			this.clearCommentTimer()
			this.commentTimer = delayC(faker.number.int({ min: 300, max: 800 }))
			await this.commentTimer

			const comment = feedMock.generateComment(postId, content, replyTo)

			store.addComment(postId, comment)
			console.log(`[FeedManager] 添加评论成功: ${postId}`)
		} catch (error) {
			console.error('[FeedManager] 添加评论失败:', error)
		} finally {
			this.commentTimer = null
		}
	}
}

export const feedMgr = new FeedManager() // 更新游标为新的最后一条 // 解析游标获取时间基准点
