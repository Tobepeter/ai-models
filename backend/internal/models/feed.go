package models

// FeedPost 信息流帖子模型
type FeedPost struct {
	BaseModel                                                             // 嵌入基础模型，获得uint64 ID + 时间戳
	UserID             uint64 `json:"user_id" gorm:"not null;index" swaggertype:"string"`
	Username           string `json:"username" gorm:"type:varchar(100);not null"`       // 冗余字段
	Avatar             string `json:"avatar" gorm:"type:varchar(500)"`                  // 冗余头像
	Status             string `json:"status" gorm:"type:varchar(50)"`                   // 用户状态emoji
	Content            string `json:"content" gorm:"type:text"`                         // 文字内容（可选）
	ImageURL           string `json:"image_url" gorm:"type:varchar(500)"`               // 图片URL（可选）  
	LikeCount          int    `json:"like_count" gorm:"default:0"`
	CommentCount       int    `json:"comment_count" gorm:"default:0"`
	UserProfileVersion int64  `json:"user_profile_version"`                             // 用户信息版本号

	// 复合索引优化
	// idx_like_count: like_count DESC, id
	// idx_comment_count: comment_count DESC, id  
	// idx_user_created: user_id, created_at DESC
}

// FeedComment 信息流评论模型
type FeedComment struct {
	BaseModel                                                                  // 嵌入基础模型，获得uint64 ID + 时间戳
	PostID             uint64 `json:"post_id" gorm:"not null;index:idx_post_created" swaggertype:"string"`
	UserID             uint64 `json:"user_id" gorm:"not null;index:idx_user_created" swaggertype:"string"`
	Username           string `json:"username" gorm:"type:varchar(100);not null"`       // 冗余字段
	Avatar             string `json:"avatar" gorm:"type:varchar(500)"`                  // 冗余头像
	Content            string `json:"content" gorm:"type:text;not null"`
	ReplyTo            string `json:"reply_to" gorm:"type:varchar(100)"`                // 回复的用户名
	LikeCount          int    `json:"like_count" gorm:"default:0"`
	UserProfileVersion int64  `json:"user_profile_version"`                             // 用户信息版本号
}

// FeedPostResponse 帖子响应结构
type FeedPostResponse struct {
	Posts      []FeedPost `json:"posts"`
	NextCursor string     `json:"next_cursor,omitempty"`
	HasMore    bool       `json:"has_more"`
}

// FeedCommentResponse 评论响应结构
type FeedCommentResponse struct {
	Comments   []FeedComment `json:"comments"`
	NextCursor string        `json:"next_cursor,omitempty"`
	HasMore    bool          `json:"has_more"`
	Total      int64         `json:"total"`
}

// CreateFeedPostRequest 创建帖子请求
type CreateFeedPostRequest struct {
	Content  string `json:"content,omitempty" validate:"max=2000"`            // 最多2000字符
	ImageURL string `json:"image_url,omitempty" validate:"url"`               // 图片URL
}

// CreateFeedCommentRequest 创建评论请求  
type CreateFeedCommentRequest struct {
	Content string `json:"content" validate:"required,max=500"`              // 评论内容，最多500字符
	ReplyTo string `json:"reply_to,omitempty" validate:"max=100"`            // 回复的用户名
}

// ToggleLikeRequest 切换点赞请求
type ToggleLikeRequest struct {
	PostID string `json:"post_id" validate:"required"`
}

// FeedQueryParams 信息流查询参数
type FeedQueryParams struct {
	Sort     string `form:"sort" validate:"oneof=time like comment"`         // 排序类型：time, like, comment
	AfterID  string `form:"after_id"`                                        // cursor分页的after_id
	Limit    int    `form:"limit" validate:"min=1,max=50"`                   // 每页数量，最多50
}

// PostLike 帖子点赞模型
type PostLike struct {
	BaseModel                                                                        // 嵌入基础模型，获得uint64 ID + 时间戳
	PostID    uint64 `json:"post_id" gorm:"not null;uniqueIndex:idx_post_user_unique" swaggertype:"string"`
	UserID    uint64 `json:"user_id" gorm:"not null;uniqueIndex:idx_post_user_unique" swaggertype:"string"`
	
	// 复合唯一索引，防止重复点赞
	// UNIQUE KEY idx_post_user_unique (post_id, user_id)
}

// CommentQueryParams 评论查询参数
type CommentQueryParams struct {
	PostID   string `form:"post_id" validate:"required"`
	AfterID  string `form:"after_id"`                                        // cursor分页的after_id
	Limit    int    `form:"limit" validate:"min=1,max=50"`                   // 每页数量，最多50
}