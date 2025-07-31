package models

// FeedPost 信息流帖子模型
type FeedPost struct {
	BaseModel                 // 嵌入基础模型，获得uint64 ID + 时间戳
	UserID             uint64 `gorm:"not null;index" swaggertype:"string"`
	Username           string `gorm:"type:varchar(100);not null"` // 冗余字段
	Avatar             string `gorm:"type:varchar(500)"`          // 冗余头像
	Status             string `gorm:"type:varchar(50)"`           // 用户状态emoji
	Content            string `gorm:"type:text"`                  // 文字内容（可选）
	ImageURL           string `gorm:"type:varchar(500)"`          // 图片URL（可选）
	LikeCount          int    `gorm:"default:0"`
	CommentCount       int    `gorm:"default:0"`
	UserProfileVersion int64  // 用户信息版本号

	// 复合索引优化
	// idx_like_count: like_count DESC, id
	// idx_comment_count: comment_count DESC, id
	// idx_user_created: user_id, created_at DESC
}

// FeedComment 信息流评论模型
type FeedComment struct {
	BaseModel                 // 嵌入基础模型，获得uint64 ID + 时间戳
	PostID             uint64 `gorm:"not null;index:idx_post_created" swaggertype:"string"`
	UserID             uint64 `gorm:"not null;index:idx_user_created" swaggertype:"string"`
	Username           string `gorm:"type:varchar(100);not null"` // 冗余字段
	Avatar             string `gorm:"type:varchar(500)"`          // 冗余头像
	Content            string `gorm:"type:text;not null"`
	ReplyTo            string `gorm:"type:varchar(100)"` // 回复的用户名
	LikeCount          int    `gorm:"default:0"`
	UserProfileVersion int64  // 用户信息版本号
}

// FeedPostResponse 帖子响应结构
type FeedPostResponse struct {
	Posts      []FeedPost
	NextCursor string `json:",omitempty"`
	HasMore    bool
}

// FeedCommentResponse 评论响应结构
type FeedCommentResponse struct {
	Comments   []FeedComment
	NextCursor string `json:",omitempty"`
	HasMore    bool
	Total      int64
}

// CreateFeedPostRequest 创建帖子请求
type CreateFeedPostRequest struct {
	Content  string `json:",omitempty" validate:"max=2000"` // 最多2000字符
	ImageURL string `json:",omitempty" validate:"url"`      // 图片URL
}

// CreateFeedCommentRequest 创建评论请求
type CreateFeedCommentRequest struct {
	Content string `validate:"required,max=500"`          // 评论内容，最多500字符
	ReplyTo string `json:",omitempty" validate:"max=100"` // 回复的用户名
}

// ToggleLikeRequest 切换点赞请求
type ToggleLikeRequest struct {
	PostID string `validate:"required"`
}

// FeedQueryParams 信息流查询参数
type FeedQueryParams struct {
	Sort    string `form:"sort" validate:"oneof=time like comment"` // 排序类型：time, like, comment
	AfterID string `form:"after_id"`                                // cursor分页的after_id
	Limit   int    `form:"limit" validate:"min=1,max=50"`           // 每页数量，最多50
}

// PostLike 帖子点赞模型
type PostLike struct {
	BaseModel        // 嵌入基础模型，获得uint64 ID + 时间戳
	PostID    uint64 `gorm:"not null;uniqueIndex:idx_post_user_unique" swaggertype:"string"`
	UserID    uint64 `gorm:"not null;uniqueIndex:idx_post_user_unique" swaggertype:"string"`

	// 复合唯一索引，防止重复点赞
	// UNIQUE KEY idx_post_user_unique (post_id, user_id)
}

// CommentQueryParams 评论查询参数
type CommentQueryParams struct {
	PostID  string `form:"post_id" binding:"required"`
	AfterID string `form:"after_id"`                       // cursor分页的after_id
	Limit   int    `form:"limit" binding:"min=1,max=50"`   // 每页数量，最多50
}
