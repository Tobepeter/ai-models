import type { FeedComment, FeedPost } from '@/api/swagger/generated'

export interface AppFeedComment extends FeedComment {
	isLiked?: boolean // 前端特有：是否已点赞
}

export interface AppFeedPost extends FeedPost {
	isLiked?: boolean // 前端特有：是否已点赞
	isExpanded?: boolean // 前端特有：长内容展开状态
	comments?: AppFeedComment[] // 前端特有：评论列表缓存
}

/* 前端评论分页管理 - 基于后端FeedCommentResponse但适配前端需求 */
export interface FeedCommentList {
	comments: string[] // commentId 数组 (前端使用ID数组 + 详情映射的模式)
	commentsById: Record<string, AppFeedComment> // 评论详情映射
	next_cursor?: string // 下一页游标 (继承后端字段)
	has_more?: boolean // 是否有更多 (继承后端字段)
	total?: number // 总数量 (继承后端字段)
	pageSize: number // 每页大小
	loading: boolean // 加载状态
	error?: string // 错误信息
}
