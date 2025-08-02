import { storageKeys } from '@/utils/storage'
import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'
import { feedConfig } from './feed-config'
import type { FeedComment, FeedPost, FeedCommentList } from './feed-types'

// 重新导出类型
export type { FeedComment, FeedPost, FeedCommentList }

/* 评论分页配置 */
export const COMMENT_PAGE_SIZE = feedConfig.commentPageSize

/* 信息流状态 */
const feedState = {
	// Feed 流数据 - 保持现有结构兼容性
	posts: [] as FeedPost[],
	loading: false,
	refreshing: false, // loading 的子状态，表示是刷新类型的加载
	hasMore: true,
	cursor: null as string | null, // 分页游标
	error: null as string | null,

	// 新增：扁平化存储结构
	postsById: {} as Record<string, FeedPost>, // Post 数据表
	commentsByPostId: {} as Record<string, FeedCommentList>, // 评论分页数据

	// 弹窗状态
	detailDialog: {
		isOpen: false,
		postId: null as string | null,
		scrollTop: 0, // 记录滚动位置
	},
	createDialog: {
		isOpen: false,
	},

	// 评论输入弹窗状态
	isCommentInputOpen: false,
	lastCommentCloseTime: -1, // 最后关闭评论弹窗的时间戳，用于防止快速切换
}

type FeedState = typeof feedState

const stateCreator = () => {
	return combine(feedState, (set, get) => ({
		setData: (data: Partial<FeedState>) => set(data), // 更新部分状态
		setLoading: (loading: boolean) => set({ loading }),
		setError: (error: string | null) => set({ error }),

		prependPosts: (newPosts: FeedPost[]) => {
			const { posts } = get()
			set({ posts: [...newPosts, ...posts] }) // 刷新时新数据加在前面
		},

		appendPosts: (newPosts: FeedPost[]) => {
			const { posts } = get()
			set({ posts: [...posts, ...newPosts] }) // 加载更多时新数据加在后面
		},

		addNewPost: (newPost: FeedPost) => {
			const { posts } = get()
			set({ posts: [newPost, ...posts] }) // 新创建的post加在最前面
		},

		updatePost: (postId: string, updates: Partial<FeedPost>) => {
			const { posts } = get()
			const updatedPosts = posts.map((post) => (post.id === postId ? { ...post, ...updates } : post))
			set({ posts: updatedPosts })
		},

		toggleLike: (postId: string) => {
			const { posts } = get()
			const updatedPosts = posts.map((post) => {
				if (post.id === postId) {
					const isLiked = !post.isLiked
					return {
						...post,
						isLiked,
						like_count: isLiked ? post.like_count + 1 : post.like_count - 1, // 同步更新点赞数
					}
				}
				return post
			})
			set({ posts: updatedPosts })
		},

		toggleExpand: (postId: string) => {
			const { posts } = get()
			const updatedPosts = posts.map((post) => (post.id === postId ? { ...post, isExpanded: !post.isExpanded } : post))
			set({ posts: updatedPosts })
		},

		addComment: (postId: string, comment: FeedComment) => {
			const { posts } = get()
			const updatedPosts = posts.map((post) => {
				if (post.id === postId) {
					const existingComments = Array.isArray(post.comments) ? post.comments : []
					return {
						...post,
						comments: [comment, ...existingComments], // 新评论在前
						comment_count: post.comment_count + 1,
					}
				}
				return post
			})
			set({ posts: updatedPosts })
		},

		// 详情页弹窗管理
		openDetailDialog: (postId: string) => {
			set({
				detailDialog: {
					isOpen: true,
					postId,
					scrollTop: 0,
				},
			})
		},

		closeDetailDialog: () => {
			const { detailDialog, commentsByPostId } = get()
			// 清理多余评论缓存，只保留第一页
			if (detailDialog.postId) {
				const postComments = commentsByPostId[detailDialog.postId]
				if (postComments && postComments.comments.length > COMMENT_PAGE_SIZE) {
					const firstPageComments = postComments.comments.slice(0, COMMENT_PAGE_SIZE)
					const firstPageCommentsById: Record<string, FeedComment> = {}
					firstPageComments.forEach((id) => {
						if (postComments.commentsById[id]) {
							firstPageCommentsById[id] = postComments.commentsById[id]
						}
					})

					set({
						commentsByPostId: {
							...commentsByPostId,
							[detailDialog.postId]: {
								...postComments,
								comments: firstPageComments,
								commentsById: firstPageCommentsById,
								next_cursor: firstPageComments.length >= COMMENT_PAGE_SIZE ? postComments.next_cursor : undefined,
							},
						},
					})
				}
			}

			set({
				detailDialog: {
					isOpen: false,
					postId: null,
					scrollTop: 0,
				},
			})
		},

		setDetailScrollTop: (scrollTop: number) => {
			const { detailDialog } = get()
			set({
				detailDialog: {
					...detailDialog,
					scrollTop,
				},
			})
		},

		// 创建弹窗管理
		openCreateDialog: () => {
			set({
				createDialog: {
					isOpen: true,
				},
			})
		},

		closeCreateDialog: () => {
			set({
				createDialog: {
					isOpen: false,
				},
			})
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

		// 评论分页管理
		setPostComments: (postId: string, comments: FeedComment[], cursor?: string, total?: number) => {
			const { commentsByPostId } = get()
			const currentPage = commentsByPostId[postId] || {
				comments: [],
				commentsById: {},
				total: 0,
				pageSize: COMMENT_PAGE_SIZE,
				loading: false,
			}

			// 构建新的评论数据
			const newCommentsById = { ...currentPage.commentsById }
			const newCommentIds = comments.map((comment) => {
				newCommentsById[comment.id] = comment
				return comment.id
			})

			const updatedComments = cursor
				? [...currentPage.comments, ...newCommentIds] // 追加模式
				: newCommentIds // 替换模式

			set({
				commentsByPostId: {
					...commentsByPostId,
					[postId]: {
						...currentPage,
						comments: updatedComments,
						commentsById: newCommentsById,
						next_cursor: cursor,
						total: total ?? currentPage.total,
						loading: false,
						error: undefined,
					},
				},
			})
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
			})),
			cursor: state.cursor,
			postsById: state.postsById, // 持久化 post 数据表
			commentsByPostId: Object.fromEntries(
				Object.entries(state.commentsByPostId).map(([postId, page]) => [
					postId,
					{
						...page,
						// 只保留第一页评论
						comments: page.comments.slice(0, COMMENT_PAGE_SIZE),
						commentsById: Object.fromEntries(
							page.comments
								.slice(0, COMMENT_PAGE_SIZE)
								.map((id) => [id, page.commentsById[id]])
								.filter(([, comment]) => comment)
						),
						loading: false, // 不持久化加载状态
						error: undefined, // 不持久化错误状态
					},
				])
			),
			// 不持久化弹窗状态
		}),
	})
)

export type FeedStore = ReturnType<typeof useFeedStore>
