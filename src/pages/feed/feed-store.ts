import { storageKeys } from '@/utils/storage'
import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'
import { produce } from 'immer'
import { feedConfig } from './feed-config'
import type { AppFeedComment, AppFeedPost, DetailComments } from './feed-types'

// 重新导出类型
export type { AppFeedComment as FeedComment, AppFeedPost as FeedPost, DetailComments }

const { commentPageSize } = feedConfig

// 信息流状态
const feedState = {
	// Feed 流数据
	posts: [] as AppFeedPost[],
	loading: false,
	refreshing: false, // loading 的子状态，表示是刷新类型的加载
	hasMore: true,
	cursor: '', // 分页游标
	error: '',

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
		// 更新部分状态
		setData: (data: Partial<FeedState>) => set(data),
		// 设置加载状态
		setLoading: (loading: boolean) => set({ loading }),
		// 设置错误信息
		setError: (error: string) => set({ error }),

		// 在列表前面添加新帖子
		prependPosts: (newPosts: AppFeedPost[]) => {
			set(
				produce((draft) => {
					draft.posts.unshift(...newPosts) // 刷新时新数据加在前面
				})
			)
		},

		// 在列表后面添加新帖子
		appendPosts: (newPosts: AppFeedPost[]) => {
			set(
				produce((draft) => {
					draft.posts.push(...newPosts) // 加载更多时新数据加在后面
				})
			)
		},

		// 添加新创建的帖子
		addNewPost: (newPost: AppFeedPost) => {
			set(
				produce((draft) => {
					draft.posts.unshift(newPost) // 新创建的post加在最前面
				})
			)
		},

		// 更新指定帖子
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

		// 切换帖子点赞状态
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

		// 切换帖子展开状态
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

		// 添加评论到帖子
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

		// 设置评论输入弹窗状态
		setCommentInputOpen: (isOpen: boolean) => {
			if (!isOpen) {
				// 关闭时记录时间戳
				set({ isCommentInputOpen: isOpen, lastCommentCloseTime: Date.now() })
			} else {
				set({ isCommentInputOpen: isOpen })
			}
		},

		// 设置帖子详情页评论数据
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

		// 追加帖子评论
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

		// 设置帖子评论加载状态
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

		// 设置帖子评论错误状态
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

		// 清除帖子详情页评论数据
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

		// 重置为初始状态
		reset: () => set(feedState),
		// 清除错误状态
		clearError: () => set({ error: '' }),
	}))
}

export const useFeedStore = create(
	persist(stateCreator(), {
		name: storageKeys.feed,
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
