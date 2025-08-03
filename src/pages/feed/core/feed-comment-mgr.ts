import { useFeedStore } from '../feed-store'
import { feedMock } from './feed-mock'
import { feedConfig } from './feed-config'
import { delayC } from '../../../utils/common'
import { CancelablePromise } from '../../../utils/cancelable-promise'
import { api } from '@/api/api'

/**
 * Feed评论管理器
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
		console.warn('[FeedCommentManager] 此方法已弃用，请使用 feedDetailMgr.initComments')
		// 此方法已被 feed-detail-mgr.ts 中的逻辑替代
	}

	// 加载更多评论
	async loadMoreComments(postId: string) {
		console.warn('[FeedCommentManager] 此方法已弃用，请使用 feedDetailMgr.loadMoreComments')
		// 此方法已被 feed-detail-mgr.ts 中的逻辑替代
	}

	// 清理详情页评论数据
	clearPostComments(postId: string) {
		console.warn('[FeedCommentManager] 此方法已弃用，请使用 feedDetailMgr.closeDetail')
		// 此方法已被 feed-detail-mgr.ts 中的逻辑替代
	}
}

export const feedCommentMgr = new FeedCommentMgr()