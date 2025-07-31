/* 评论数据结构 */
export interface FeedComment {
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
	comments: FeedComment[] // 评论列表
}

/* 评论分页数据结构 */
export interface FeedCommentList {
	comments: string[] // commentId 数组
	commentsById: Record<string, FeedComment> // 评论详情
	nextCursor?: string
	prevCursor?: string
	total: number
	pageSize: number
	loading: boolean
	error?: string
}