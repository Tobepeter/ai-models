import { storageKeys } from '@/utils/storage'
import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'

/* 评论数据结构 */
export interface Comment {
	id: string
	postId: string
	userId: string
	username: string
	avatar: string
	content: string
	replyTo?: string // 回复的用户名
	createdAt: string
	likeCount: number
	isLiked: boolean
}

/* 信息流帖子数据结构 */
export interface FeedPost {
	id: string
	userId: string
	username: string
	avatar: string
	status?: string // 用户状态emoji
	content?: string // 可选文字内容
	image?: string // 可选单张图片
	createdAt: string
	likeCount: number
	commentCount: number
	isLiked: boolean
	isExpanded: boolean // 长内容展开状态
	comments: Comment[] // 评论列表
}

/* 信息流状态 */
const feedState = {
	posts: [] as FeedPost[],
	loading: false,
	refreshing: false, // loading 的子状态，表示是刷新类型的加载
	hasMore: true,
	cursor: null as string | null, // 分页游标
	error: null as string | null,
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
						likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1, // 同步更新点赞数
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


		addComment: (postId: string, comment: Comment) => {
			const { posts } = get()
			const updatedPosts = posts.map((post) => {
				if (post.id === postId) {
					const existingComments = Array.isArray(post.comments) ? post.comments : []
					return {
						...post,
						comments: [comment, ...existingComments], // 新评论在前
						commentCount: post.commentCount + 1,
					}
				}
				return post
			})
			set({ posts: updatedPosts })
		},

		clear: () => set(feedState), // 重置为初始状态
		clearError: () => set({ error: null }),
	}))
}

export const useFeedStore = create(
	persist(stateCreator(), {
		name: storageKeys.feed || 'feed-storage',
		partialize: (state) => ({
			posts: state.posts.slice(0, 50).map(post => ({
				...post,
				isExpanded: false, // 不持久化内容展开状态
			})),
			cursor: state.cursor,
		}),
	})
)

export type FeedStore = ReturnType<typeof useFeedStore>
