import { storageKeys } from '@/utils/storage'
import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'
import type { AppFeedComment, AppFeedPost } from './feed-types'

export type { AppFeedComment as FeedComment, AppFeedPost as FeedPost } // 重新导出类型

const feedState = { // 信息流状态
	posts: [] as AppFeedPost[], // Feed 流数据
	loading: false,
	refreshing: false, // loading 的子状态，表示是刷新类型的加载
	hasMore: true,
	cursor: '', // 分页游标
	refreshError: '', // 刷新(初始加载)错误
	loadMoreError: '', // 加载更多错误
	isDetailDialogOpen: false, // 弹窗状态 - 直接定义简单状态
	detailDialogPostId: '',
	isCreateDialogOpen: false,
	isCommentInputOpen: false, // 控制打开评论时候，防止误触继续二次打开其他评论
	lastCommentCloseTime: -1, // 最后关闭评论弹窗的时间戳，用于防止快速切换
}

type FeedState = typeof feedState

const stateCreator = () => {
	return combine(feedState, (set) => ({
		// 更新部分状态
		setData: (data: Partial<FeedState>) => set(data),
		// 设置加载状态
		setLoading: (loading: boolean) => set({ loading }),
		// 设置刷新错误
		setRefreshError: (refreshError: string) => set({ refreshError }),
		// 设置加载更多错误
		setLoadMoreError: (loadMoreError: string) => set({ loadMoreError }),

		// 在列表前面添加新帖子
		prependPosts: (newPosts: AppFeedPost[]) => set((state) => ({
			posts: newPosts.concat(state.posts) // 刷新时新数据加在前面
		})),

		// 在列表后面添加新帖子
		appendPosts: (newPosts: AppFeedPost[]) => set((state) => ({
			posts: state.posts.concat(newPosts) // 加载更多时新数据加在后面
		})),

		// 添加新创建的帖子
		addNewPost: (newPost: AppFeedPost) => set((state) => ({
			posts: [newPost].concat(state.posts) // 新创建的post加在最前面
		})),

		// 更新指定帖子
		updatePost: (postId: string, updates: Partial<AppFeedPost>) => set((state) => ({
			posts: state.posts.map(post => 
				post.id === postId ? { ...post, ...updates } : post
			)
		})),

		// 切换帖子点赞状态
		toggleLike: (postId: string) => set((state) => ({
			posts: state.posts.map(post => 
				post.id === postId ? {
					...post,
					isLiked: !post.isLiked,
					like_count: post.like_count + (post.isLiked ? -1 : 1)
				} : post
			)
		})),

		// 切换帖子展开状态
		toggleExpand: (postId: string) => set((state) => ({
			posts: state.posts.map(post => 
				post.id === postId ? { ...post, isExpanded: !post.isExpanded } : post
			)
		})),

		// 添加评论到帖子
		addComment: (postId: string, comment: AppFeedComment) => set((state) => ({
			posts: state.posts.map(post => 
				post.id === postId ? {
					...post,
					preloaded_comments: [comment].concat(post.preloaded_comments || []),
					comment_count: (post.comment_count || 0) + 1
				} : post
			)
		})),

		// 删除帖子
		deletePost: (postId: string) => set((state) => ({
			posts: state.posts.filter(post => post.id !== postId)
		})),

		// 设置评论输入弹窗状态
		setCommentInputOpen: (isOpen: boolean) => {
			if (!isOpen) {
				set({ isCommentInputOpen: isOpen, lastCommentCloseTime: Date.now() }) // 关闭时记录时间戳
			} else {
				set({ isCommentInputOpen: isOpen })
			}
		},

		// 重置为初始状态
		reset: () => set(feedState),
		// 清除刷新错误
		clearRefreshError: () => set({ refreshError: '' }),
		// 清除加载更多错误
		clearLoadMoreError: () => set({ loadMoreError: '' }),
		// 清除所有错误
		clearAllErrors: () => set({ refreshError: '', loadMoreError: '' }),
	}))
}

export const useFeedStore = create(
	persist(stateCreator(), {
		name: storageKeys.feed,
		partialize: (state) => ({
			posts: state.posts.slice(0, 50).map((post) => ({
				...post,
				isExpanded: false, // 不持久化内容展开状态
			})),
			cursor: state.cursor, // 不持久化弹窗状态
		}),
	})
)

export type FeedStore = ReturnType<typeof useFeedStore>
