/* 评论数据结构 */
export interface FeedComment {
	id: string // 评论唯一标识
	postId: string // 所属帖子ID
	userId: string // 评论者用户ID
	username: string // 评论者用户名
	avatar: string // 评论者头像
	content: string // 评论内容
	replyTo?: string // 回复的用户名
	createdAt: string // 创建时间
	likeCount: number // 点赞数
	isLiked: boolean // 是否已点赞
}

/* 信息流帖子数据结构 */
export interface FeedPost {
	id: string // 帖子唯一标识
	userId: string // 发布者用户ID
	username: string // 发布者用户名
	avatar: string // 发布者头像
	status?: string // 用户状态emoji
	content?: string // 可选文字内容
	image?: string // 可选单张图片
	createdAt: string // 创建时间
	likeCount: number // 点赞数
	commentCount: number // 评论数
	isLiked: boolean // 是否已点赞
	isExpanded: boolean // 长内容展开状态
	comments?: FeedComment[] // 评论列表
}

/* 评论分页数据结构 */
export interface FeedCommentList {
	comments: string[] // commentId 数组
	commentsById: Record<string, FeedComment> // 评论详情
	nextCursor?: string // 下一页游标
	prevCursor?: string // 上一页游标
	total: number // 总数量
	pageSize: number // 每页大小
	loading: boolean // 加载状态
	error?: string // 错误信息
}
