import { storageKeys } from '@/utils/storage'
import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'
import { produce } from 'immer'
import { feedConfig } from './feed-config'
import type { AppFeedComment, AppFeedPost, DetailComments } from './feed-types'

// 重新导出类型
export type { AppFeedComment as FeedComment, AppFeedPost as FeedPost, DetailComments }

const { commentPageSize } = feedConfig

/* 信息流状态 */
const feedState = {
	// Feed 流数据
	posts: [] as AppFeedPost[],
	loading: false,
	refreshing: false, // loading 的子状态，表示是刷新类型的加载
	hasMore: true,
	cursor: null as string | null, // 分页游标
	error: null as string | null,

	// 弹窗状态 - 直接定义简单状态
	isDetailDialogOpen: false,
	detailDialogPostId: '',
	isCreateDialogOpen: false,

	// 控制打开评论时候，防止误触继续二次打开其他评论
	isCommentInputOpen: false, // 评论输入弹窗状态
	lastCommentCloseTime: -1, // 最后关闭评论弹窗的时间戳，用于防止快速切换
}

type FeedState = typeof feedState

const stateCreator = () => {
	return combine(feedState, (set) => ({
		setData: (data: Partial<FeedState>) => set(data), // 更新部分状态
		setLoading: (loading: boolean) => set({ loading }),
		setError: (error: string | null) => set({ error }),

		prependPosts: (newPosts: AppFeedPost[]) => {
			set(
				produce((draft) => {
					draft.posts.unshift(...newPosts) // 刷新时新数据加在前面
				})
			)
		},

		appendPosts: (newPosts: AppFeedPost[]) => {
			set(
				produce((draft) => {
					draft.posts.push(...newPosts) // 加载更多时新数据加在后面
				})
			)
		},

		addNewPost: (newPost: AppFeedPost) => {
			set(
				produce((draft) => {
					draft.posts.unshift(newPost) // 新创建的post加在最前面
				})
			)
		},

		updatePost: (postId: string, updates: Partial<AppFeedPost>) => {
			set(
				produce((draft) => {
					const post = draft.posts.find((p: AppFeedPost) => p.id === postId)
					if (post) {
						Object.assign(post, updates)
					}
				})
			)
		},

		toggleLike: (postId: string) => {
			set(
				produce((draft) => {
					const post = draft.posts.find((p: AppFeedPost) => p.id === postId)
					if (post) {
						post.isLiked = !post.isLiked
						post.like_count += post.isLiked ? 1 : -1 // 同步更新点赞数
					}
				})
			)
		},

		toggleExpand: (postId: string) => {
			set(
				produce((draft) => {
					const post = draft.posts.find((p: AppFeedPost) => p.id === postId)
					if (post) {
						post.isExpanded = !post.isExpanded
					}
				})
			)
		},

		addComment: (postId: string, comment: AppFeedComment) => {
			set(
				produce((draft) => {
					const post = draft.posts.find((p: AppFeedPost) => p.id === postId)
					if (post) {
						// 更新预加载评论
						post.preloaded_comments = post.preloaded_comments || []
						post.preloaded_comments.unshift(comment)

						// 更新详情页评论（如果存在）
						if (post.detail_comments) {
							post.detail_comments.loaded_comments.unshift(comment)
						}

						// 更新评论数量
						post.comment_count = (post.comment_count || 0) + 1
					}
				})
			)
		},

		// 评论输入弹窗管理
		setCommentInputOpen: (isOpen: boolean) => {
			if (!isOpen) {
				// 关闭时记录时间戳
				set({ isCommentInputOpen: isOpen, lastCommentCloseTime: Date.now() })
			} else {
				set({ isCommentInputOpen: isOpen })
			}
		},

		// 详情页评论管理
		setPostDetailComments: (postId: string, detailComments: DetailComments) => {
			set(
				produce((draft) => {
					const post = draft.posts.find((p: AppFeedPost) => p.id === postId)
					if (post) {
						post.detail_comments = detailComments
					}
				})
			)
		},

		appendPostComments: (postId: string, newComments: AppFeedComment[], nextCursor?: string, hasMore?: boolean) => {
			set(
				produce((draft) => {
					const post = draft.posts.find((p: AppFeedPost) => p.id === postId)
					if (post?.detail_comments) {
						post.detail_comments.loaded_comments.push(...newComments)
						post.detail_comments.next_cursor = nextCursor
						post.detail_comments.has_more = hasMore
						post.detail_comments.loading = false
						post.detail_comments.error = undefined
					}
				})
			)
		},

		setPostCommentsLoading: (postId: string, loading: boolean) => {
			set(
				produce((draft) => {
					const post = draft.posts.find((p: AppFeedPost) => p.id === postId)
					if (post?.detail_comments) {
						post.detail_comments.loading = loading
					}
				})
			)
		},

		setPostCommentsError: (postId: string, error?: string) => {
			set(
				produce((draft) => {
					const post = draft.posts.find((p: AppFeedPost) => p.id === postId)
					if (post?.detail_comments) {
						post.detail_comments.loading = false
						post.detail_comments.error = error
					}
				})
			)
		},

		clearPostDetailComments: (postId: string) => {
			set(
				produce((draft) => {
					const post = draft.posts.find((p: AppFeedPost) => p.id === postId)
					if (post) {
						delete post.detail_comments
					}
				})
			)
		},

		reset: () => set(feedState), // 重置为初始状态
		clearError: () => set({ error: null }),
	}))
}

export const useFeedStore = create(
	persist(stateCreator(), {
		name: storageKeys.feed || 'feed-storage',
		partialize: (state) => ({
			posts: state.posts.slice(0, 50).map((post) => ({
				...post,
				isExpanded: false, // 不持久化内容展开状态
				detail_comments: undefined, // 不持久化详情页评论状态
			})),
			cursor: state.cursor,
			// 不持久化弹窗状态
		}),
	})
)

export type FeedStore = ReturnType<typeof useFeedStore>
