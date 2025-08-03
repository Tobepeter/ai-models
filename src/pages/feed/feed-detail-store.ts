import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { produce } from 'immer'
import type { AppFeedComment, AppFeedPost } from './feed-types'

// 详情页状态
const feedDetailState = {
	// 当前详情页数据
	currPost: null as Nullable<AppFeedPost>,

	// 评论相关状态
	comments: [] as AppFeedComment[], // 评论列表
	commentsCursor: '', // 下一页cursor
	commentsHasMore: false, // 是否有更多
	commentsLoading: false, // 评论加载状态
	commentsError: '', // 评论错误信息

	// UI状态
	isDialogOpen: false, // 弹窗是否打开
	dialogPostId: '', // 弹窗显示的postId

	// 加载状态
	loading: false,
	error: '',
}

type FeedDetailState = typeof feedDetailState

const stateCreator = () => {
	return combine(feedDetailState, (set, get) => ({
		// 更新部分状态
		setData: (data: Partial<FeedDetailState>) => set(data),

		// 设置当前post
		setCurrPost: (post: AppFeedPost | null) => set({ currPost: post }),

		// 设置加载状态
		setLoading: (loading: boolean) => set({ loading }),

		// 设置错误信息
		setError: (error: string) => set({ error }),

		// 打开弹窗
		openDialog: (postId: string, post?: AppFeedPost) => {
			set({
				isDialogOpen: true,
				dialogPostId: postId,
				currPost: post || null,
			})
		},

		// 关闭弹窗
		closeDialog: () => {
			set(feedDetailState) // 关闭弹窗时完全重置状态
		},

		// 初始化评论数据（用于进入详情页时）
		initComments: (comments: AppFeedComment[], cursor?: string, hasMore?: boolean) => {
			set({
				comments: [...comments],
				commentsCursor: cursor || '',
				commentsHasMore: hasMore ?? false,
				commentsLoading: false,
				commentsError: '',
			})
		},

		// 设置评论加载状态
		setCommentsLoading: (loading: boolean) => {
			set({ commentsLoading: loading })
		},

		// 设置评论错误状态
		setCommentsError: (error?: string) => {
			set({
				commentsLoading: false,
				commentsError: error || '',
			})
		},

		// 追加评论（分页加载）
		appendComments: (newComments: AppFeedComment[], nextCursor?: string, hasMore?: boolean) => {
			const state = get()
			set(
				produce(state, (draft) => {
					draft.comments.push(...newComments)
				})
			)
			set({
				commentsCursor: nextCursor || '',
				commentsHasMore: hasMore ?? false,
				commentsLoading: false,
				commentsError: '',
			})
		},

		// 添加新评论（乐观更新）
		addComment: (comment: AppFeedComment) => {
			const state = get()
			set(
				produce(state, (draft) => {
					draft.comments.unshift(comment)
					// 同时更新当前post的评论数量
					if (draft.currPost) {
						draft.currPost.comment_count = (draft.currPost.comment_count || 0) + 1
					}
				})
			)
		},

		// 更新当前post的部分数据
		updateCurrPost: (updates: Partial<AppFeedPost>) => {
			const state = get()
			if (state.currPost) {
				set({
					currPost: { ...state.currPost, ...updates },
				})
			}
		},

		// 切换当前post的点赞状态
		toggleCurrPostLike: () => {
			const state = get()
			if (state.currPost) {
				const newLiked = !state.currPost.is_liked
				const newCount = state.currPost.like_count + (newLiked ? 1 : -1)
				set({
					currPost: {
						...state.currPost,
						is_liked: newLiked,
						like_count: newCount,
					},
				})
			}
		},

		// 重置为初始状态
		reset: () => set(feedDetailState),

		// 清除错误状态
		clearError: () => set({ error: '' }),
	}))
}

export const useFeedDetailStore = create(stateCreator())

export type FeedDetailStore = ReturnType<typeof useFeedDetailStore>
