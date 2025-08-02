package config

import "time"

// Feed相关配置常量
var (
	FeedMaxCachedComments     = 20               // 最大缓存评论数量
	FeedCommentCacheTTL       = 30 * time.Minute // 评论缓存过期时间
	FeedCommentCacheKeyPrefix = "feed:comments:" // 评论缓存键前缀
)