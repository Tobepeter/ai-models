import type { FeedComment, FeedPostResponseItem } from '@/api/swagger/generated'

export interface AppFeedComment extends FeedComment {
	isLiked?: boolean // 前端特有：是否已点赞
}

/* 详情页评论分页管理 */
export interface DetailComments {
	loaded_comments: AppFeedComment[] // 完整评论列表（preloaded + 详情页加载）
	next_cursor?: string // 下一页cursor
	has_more?: boolean // 是否有更多
	loading?: boolean // 加载状态
	error?: string // 错误信息
}

export interface AppFeedPost extends FeedPostResponseItem {
	isLiked?: boolean // 前端特有：是否已点赞
	isExpanded?: boolean // 前端特有：长内容展开状态
	detail_comments?: DetailComments // 前端特有：详情页评论分页管理
}
