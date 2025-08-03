import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { produce } from 'immer'
import type { AppFeedComment, AppFeedPost } from './feed-types'

// 详情页评论状态
interface DetailCommentState {
	comments: AppFeedComment[] // 评论列表
	cursor?: string // 下一页cursor
	hasMore?: boolean // 是否有更多
	loading?: boolean // 加载状态
	error?: string // 错误信息
}

// 详情页状态
const feedDetailState = {
	// 当前详情页数据
	currentPost: null as AppFeedPost | null,
	
	// 评论状态
	commentState: {
		comments: [],
		cursor: undefined,
		hasMore: false,
		loading: false,
		error: undefined,
	} as DetailCommentState,
	
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
		setCurrentPost: (post: AppFeedPost | null) => set({ currentPost: post }),
		
		// 设置加载状态
		setLoading: (loading: boolean) => set({ loading }),
		
		// 设置错误信息
		setError: (error: string) => set({ error }),
		
		// 打开弹窗
		openDialog: (postId: string, post?: AppFeedPost) => {
			set({
				isDialogOpen: true,
				dialogPostId: postId,
				currentPost: post || null,
			})
		},
		
		// 关闭弹窗
		closeDialog: () => {
			set(feedDetailState) // 关闭弹窗时完全重置状态
		},
		
		// 初始化评论数据（用于进入详情页时）
		initComments: (comments: AppFeedComment[], cursor?: string, hasMore?: boolean) => {
			set(
				produce((draft) => {
					draft.commentState = {
						comments: [...comments],
						cursor,
						hasMore: hasMore ?? false,
						loading: false,
						error: undefined,
					}
				})
			)
		},
		
		// 设置评论加载状态
		setCommentsLoading: (loading: boolean) => {
			set(
				produce((draft) => {
					draft.commentState.loading = loading
				})
			)
		},
		
		// 设置评论错误状态
		setCommentsError: (error?: string) => {
			set(
				produce((draft) => {
					draft.commentState.loading = false
					draft.commentState.error = error
				})
			)
		},
		
		// 追加评论（分页加载）
		appendComments: (newComments: AppFeedComment[], nextCursor?: string, hasMore?: boolean) => {
			set(
				produce((draft) => {
					draft.commentState.comments.push(...newComments)
					draft.commentState.cursor = nextCursor
					draft.commentState.hasMore = hasMore ?? false
					draft.commentState.loading = false
					draft.commentState.error = undefined
				})
			)
		},
		
		// 添加新评论（乐观更新）
		addComment: (comment: AppFeedComment) => {
			set(
				produce((draft) => {
					draft.commentState.comments.unshift(comment)
					// 同时更新当前post的评论数量
					if (draft.currentPost) {
						draft.currentPost.comment_count = (draft.currentPost.comment_count || 0) + 1
					}
				})
			)
		},
		
		// 更新当前post的部分数据
		updateCurrentPost: (updates: Partial<AppFeedPost>) => {
			set(
				produce((draft) => {
					if (draft.currentPost) {
						Object.assign(draft.currentPost, updates)
					}
				})
			)
		},
		
		// 切换当前post的点赞状态
		toggleCurrentPostLike: () => {
			set(
				produce((draft) => {
					if (draft.currentPost) {
						draft.currentPost.is_liked = !draft.currentPost.is_liked
						draft.currentPost.like_count += draft.currentPost.is_liked ? 1 : -1
					}
				})
			)
		},
		
		// 重置为初始状态
		reset: () => set(feedDetailState),
		
		// 清除错误状态
		clearError: () => set({ error: '' }),
	}))
}

export const useFeedDetailStore = create(stateCreator())

export type FeedDetailStore = ReturnType<typeof useFeedDetailStore>