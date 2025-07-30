package models

import (
	"time"
)

// FeedPost 信息流帖子模型
type FeedPost struct {
	ID                  string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
	UserID              string    `json:"user_id" gorm:"type:varchar(36);not null;index"`
	Username            string    `json:"username" gorm:"type:varchar(100);not null"`       // 冗余字段
	Avatar              string    `json:"avatar" gorm:"type:varchar(500)"`                  // 冗余头像
	Status              string    `json:"status" gorm:"type:varchar(50)"`                   // 用户状态emoji
	Content             string    `json:"content" gorm:"type:text"`                         // 文字内容（可选）
	ImageURL            string    `json:"image_url" gorm:"type:varchar(500)"`               // 图片URL（可选）  
	LikeCount           int       `json:"like_count" gorm:"default:0"`
	CommentCount        int       `json:"comment_count" gorm:"default:0"`
	UserProfileVersion  int64     `json:"user_profile_version"`                             // 用户信息版本号
	CreatedAt           time.Time `json:"created_at" gorm:"not null;index:idx_created_at"`
	UpdatedAt           time.Time `json:"updated_at" gorm:"not null"`

	// 复合索引优化
	// idx_like_count: like_count DESC, id
	// idx_comment_count: comment_count DESC, id  
	// idx_user_created: user_id, created_at DESC
}

// FeedComment 信息流评论模型
type FeedComment struct {
	ID                 string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
	PostID             string    `json:"post_id" gorm:"type:varchar(36);not null;index:idx_post_created"`
	UserID             string    `json:"user_id" gorm:"type:varchar(36);not null;index:idx_user_created"`
	Username           string    `json:"username" gorm:"type:varchar(100);not null"`       // 冗余字段
	Avatar             string    `json:"avatar" gorm:"type:varchar(500)"`                  // 冗余头像
	Content            string    `json:"content" gorm:"type:text;not null"`
	ReplyTo            string    `json:"reply_to" gorm:"type:varchar(100)"`                // 回复的用户名
	LikeCount          int       `json:"like_count" gorm:"default:0"`
	UserProfileVersion int64     `json:"user_profile_version"`                             // 用户信息版本号
	CreatedAt          time.Time `json:"created_at" gorm:"not null;index:idx_post_created;index:idx_user_created"`
	UpdatedAt          time.Time `json:"updated_at" gorm:"not null"`
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

// CommentQueryParams 评论查询参数
type CommentQueryParams struct {
	PostID   string `form:"post_id" validate:"required"`
	AfterID  string `form:"after_id"`                                        // cursor分页的after_id
	Limit    int    `form:"limit" validate:"min=1,max=50"`                   // 每页数量，最多50
}