package services

import (
	"errors"
	"fmt"

	"ai-models-backend/internal/models"

	"gorm.io/gorm"
)

// FeedService 信息流服务
type FeedService struct {
	BaseService
	userService *UserService
}

// NewFeedService 创建信息流服务
func NewFeedService(db *gorm.DB, userService *UserService) *FeedService {
	return &FeedService{
		BaseService: BaseService{DB: db},
		userService: userService,
	}
}

// GetFeedPosts 获取信息流帖子列表
func (s *FeedService) GetFeedPosts(params models.FeedQueryParams) ([]models.FeedPost, string, bool, error) {
	var posts []models.FeedPost

	query := s.DB.Model(&models.FeedPost{})

	// 根据排序类型设置排序规则
	switch params.Sort {
	case "like":
		query = query.Order("like_count DESC, id DESC")
	case "comment":
		query = query.Order("comment_count DESC, id DESC")
	default: // "time"
		query = query.Order("created_at DESC, id DESC")
	}

	// Cursor分页处理
	if params.AfterID != "" {
		var lastPost models.FeedPost
		if err := s.DB.Where("id = ?", params.AfterID).First(&lastPost).Error; err != nil {
			return nil, "", false, fmt.Errorf("invalid cursor: %w", err)
		}

		// 根据排序类型设置cursor条件
		switch params.Sort {
		case "like":
			query = query.Where("(like_count < ? OR (like_count = ? AND id < ?))",
				lastPost.LikeCount, lastPost.LikeCount, lastPost.ID)
		case "comment":
			query = query.Where("(comment_count < ? OR (comment_count = ? AND id < ?))",
				lastPost.CommentCount, lastPost.CommentCount, lastPost.ID)
		default: // "time"
			query = query.Where("(created_at < ? OR (created_at = ? AND id < ?))",
				lastPost.CreatedAt, lastPost.CreatedAt, lastPost.ID)
		}
	}

	// 查询数据，多查一条判断是否还有更多
	// GORM的 Find() 方法如果查询不到记录是不会报错的，会返回空的slice
	// 这里的 err 是数据库查询过程中可能发生的错误，主要包括：
	// 1. 数据库连接错误 - 数据库连接断开或网络问题
	// 2. SQL语法错误 - GORM生成的SQL语句有问题
	// 3. 数据库约束错误 - 违反了数据库的约束条件
	// 4. 权限错误 - 数据库用户没有查询权限
	// 5. 表不存在错误 - 查询的表不存在
	// 6. 字段映射错误 - struct字段与数据库字段映射失败
	if err := query.Limit(params.Limit + 1).Find(&posts).Error; err != nil {
		return nil, "", false, err
	}

	// 判断是否还有更多数据
	hasMore := len(posts) > params.Limit
	if hasMore {
		posts = posts[:params.Limit] // 移除多查的那一条
	}

	// 生成下一页游标
	var nextCursor string
	if hasMore && len(posts) > 0 {
		nextCursor = fmt.Sprintf("%d", posts[len(posts)-1].ID)
	}

	return posts, nextCursor, hasMore, nil
}

// CreateFeedPost 创建信息流帖子
func (s *FeedService) CreateFeedPost(userID uint64, req models.CreateFeedPostRequest) (*models.FeedPost, error) {
	// 获取用户信息
	var user models.User
	if err := s.DB.First(&user, userID).Error; err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// 创建帖子
	post := &models.FeedPost{
		UserID:             userID,
		Username:           user.Username,
		Avatar:             user.Avatar,
		Status:             user.Status,
		Content:            req.Content,
		ImageURL:           req.ImageURL,
		LikeCount:          0,
		CommentCount:       0,
		UserProfileVersion: user.ProfileVersion,
	}

	if err := s.DB.Create(post).Error; err != nil {
		return nil, err
	}

	return post, nil
}

// GetFeedPostByID 根据ID获取帖子详情
func (s *FeedService) GetFeedPostByID(postID string) (*models.FeedPost, error) {
	postIDUint, err := s.ParseStringToUint64(postID)
	if err != nil {
		return nil, err
	}

	var post models.FeedPost
	if err := s.DB.Where("id = ?", postIDUint).First(&post).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("post not found")
		}
		return nil, err
	}
	return &post, nil
}

// ToggleLikePost 切换帖子点赞状态
func (s *FeedService) ToggleLikePost(userID uint64, postID string) error {
	postIDUint, err := s.ParseStringToUint64(postID)
	if err != nil {
		return err
	}

	// 检查帖子是否存在
	var post models.FeedPost
	if err := s.DB.Where("id = ?", postIDUint).First(&post).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("post not found")
		}
		return err
	}

	userID64 := userID

	// 检查用户是否已点赞
	var existingLike models.PostLike
	err = s.DB.Where("post_id = ? AND user_id = ?", postIDUint, userID64).First(&existingLike).Error

	// 使用事务处理点赞状态切换
	return s.DB.Transaction(func(tx *gorm.DB) error {
		if err == nil {
			// 用户已点赞，取消点赞
			if err := tx.Delete(&existingLike).Error; err != nil {
				return err
			}
			// 减少点赞数
			return tx.Model(&post).UpdateColumn("like_count", gorm.Expr("like_count - 1")).Error
		} else if errors.Is(err, gorm.ErrRecordNotFound) {
			// 用户未点赞，添加点赞
			newLike := models.PostLike{
				PostID: postIDUint,
				UserID: userID64,
			}
			if err := tx.Create(&newLike).Error; err != nil {
				return err
			}
			// 增加点赞数
			return tx.Model(&post).UpdateColumn("like_count", gorm.Expr("like_count + 1")).Error
		} else {
			// 其他数据库错误
			return err
		}
	})
}

// GetFeedComments 获取帖子评论列表
func (s *FeedService) GetFeedComments(params models.CommentQueryParams) ([]models.FeedComment, string, bool, int64, error) {
	var comments []models.FeedComment
	var total int64

	// 统计总评论数
	if err := s.DB.Model(&models.FeedComment{}).Where("post_id = ?", params.PostID).Count(&total).Error; err != nil {
		return nil, "", false, 0, err
	}

	query := s.DB.Model(&models.FeedComment{}).Where("post_id = ?", params.PostID).Order("created_at DESC, id DESC")

	// Cursor分页处理
	if params.AfterID != "" {
		var lastComment models.FeedComment
		if err := s.DB.Where("id = ?", params.AfterID).First(&lastComment).Error; err != nil {
			return nil, "", false, 0, fmt.Errorf("invalid cursor: %w", err)
		}

		query = query.Where("(created_at < ? OR (created_at = ? AND id < ?))",
			lastComment.CreatedAt, lastComment.CreatedAt, lastComment.ID)
	}

	// 查询数据，多查一条判断是否还有更多
	if err := query.Limit(params.Limit + 1).Find(&comments).Error; err != nil {
		return nil, "", false, 0, err
	}

	// 判断是否还有更多数据
	hasMore := len(comments) > params.Limit
	if hasMore {
		comments = comments[:params.Limit] // 移除多查的那一条
	}

	// 生成下一页游标
	var nextCursor string
	if hasMore && len(comments) > 0 {
		nextCursor = fmt.Sprintf("%d", comments[len(comments)-1].ID)
	}

	return comments, nextCursor, hasMore, total, nil
}

// CreateFeedComment 创建帖子评论
func (s *FeedService) CreateFeedComment(userID uint64, postID string, req models.CreateFeedCommentRequest) (*models.FeedComment, error) {
	postIDUint, err := s.ParseStringToUint64(postID)
	if err != nil {
		return nil, err
	}

	// 检查帖子是否存在
	var post models.FeedPost
	if err := s.DB.Where("id = ?", postIDUint).First(&post).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("post not found")
		}
		return nil, err
	}

	// 获取用户信息
	var user models.User
	if err := s.DB.First(&user, userID).Error; err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// 创建评论
	comment := &models.FeedComment{
		PostID:             postIDUint,
		UserID:             userID,
		Username:           user.Username,
		Avatar:             user.Avatar,
		Content:            req.Content,
		ReplyTo:            req.ReplyTo,
		LikeCount:          0,
		UserProfileVersion: user.ProfileVersion,
	}

	// 事务处理：创建评论并更新帖子评论数
	err = s.DB.Transaction(func(tx *gorm.DB) error {
		// 创建评论
		if err := tx.Create(comment).Error; err != nil {
			return err
		}

		// 增加帖子评论数
		if err := tx.Model(&post).UpdateColumn("comment_count", gorm.Expr("comment_count + 1")).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return comment, nil
}

// ToggleLikeComment 切换评论点赞状态
func (s *FeedService) ToggleLikeComment(userID uint64, commentID string) error {
	commentIDUint, err := s.ParseStringToUint64(commentID)
	if err != nil {
		return err
	}

	// 检查评论是否存在
	var comment models.FeedComment
	if err := s.DB.Where("id = ?", commentIDUint).First(&comment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("comment not found")
		}
		return err
	}

	// TODO: 实现用户点赞状态记录表
	// 目前简化处理，直接增加点赞数
	return s.DB.Model(&comment).UpdateColumn("like_count", gorm.Expr("like_count + 1")).Error
}

// SyncUserProfile 同步用户资料到信息流
func (s *FeedService) SyncUserProfile(userID uint64) error {
	// 获取最新用户信息
	var user models.User
	if err := s.DB.First(&user, userID).Error; err != nil {
		return err
	}

	userID64 := userID

	// 批量更新帖子中的用户信息
	err := s.DB.Model(&models.FeedPost{}).
		Where("user_id = ? AND user_profile_version < ?", userID64, user.ProfileVersion).
		Updates(map[string]any{
			"username":             user.Username,
			"avatar":               user.Avatar,
			"status":               user.Status,
			"user_profile_version": user.ProfileVersion,
		}).Error
	if err != nil {
		return err
	}

	// 批量更新评论中的用户信息
	return s.DB.Model(&models.FeedComment{}).
		Where("user_id = ? AND user_profile_version < ?", userID64, user.ProfileVersion).
		Updates(map[string]any{
			"username":             user.Username,
			"avatar":               user.Avatar,
			"user_profile_version": user.ProfileVersion,
		}).Error
}

// CleanOrphanData 清理孤儿数据
func (s *FeedService) CleanOrphanData() error {
	// 删除用户不存在的帖子
	subQuery := s.DB.Table("users").Select("id").Where("users.id = feed_posts.user_id")
	if err := s.DB.Where("NOT EXISTS (?)", subQuery).Delete(&models.FeedPost{}).Error; err != nil {
		return err
	}

	// 删除用户不存在的评论
	subQuery2 := s.DB.Table("users").Select("id").Where("users.id = feed_comments.user_id")
	if err := s.DB.Where("NOT EXISTS (?)", subQuery2).Delete(&models.FeedComment{}).Error; err != nil {
		return err
	}

	// 删除帖子不存在的评论
	subQuery3 := s.DB.Table("feed_posts").Select("id").Where("feed_posts.id = feed_comments.post_id")
	if err := s.DB.Where("NOT EXISTS (?)", subQuery3).Delete(&models.FeedComment{}).Error; err != nil {
		return err
	}

	// 删除帖子不存在的点赞记录
	subQuery4 := s.DB.Table("feed_posts").Select("id").Where("feed_posts.id = post_likes.post_id")
	if err := s.DB.Where("NOT EXISTS (?)", subQuery4).Delete(&models.PostLike{}).Error; err != nil {
		return err
	}

	// 删除用户不存在的点赞记录
	subQuery5 := s.DB.Table("users").Select("id").Where("users.id = post_likes.user_id")
	return s.DB.Where("NOT EXISTS (?)", subQuery5).Delete(&models.PostLike{}).Error
}
