import type { FeedComment, FeedPostResponseItem } from '@/api/swagger/generated'

export interface AppFeedComment extends FeedComment {
	isLiked?: boolean // 前端特有：是否已点赞
}

export interface AppFeedPost extends FeedPostResponseItem {
	isExpanded?: boolean // 前端特有：长内容展开状态
	isLiked?: boolean // 前端特有：是否已点赞
}
