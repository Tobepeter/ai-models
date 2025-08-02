package services

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/database"
	"context"
	"encoding/json"
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
		BaseService: BaseService{
			DB:    db,
			Redis: database.Redis,
		},
		userService: userService,
	}
}

// GetFeedPosts 获取信息流帖子列表（支持评论预载）
func (s *FeedService) GetFeedPosts(params models.FeedQueryParams) ([]models.FeedPostResponseItem, string, bool, error) {
	var posts []models.FeedPost

	query := s.DB.Model(&models.FeedPost{})

	// 计算排序方式
	if params.AfterID != "" {
		// 有cursor分页，设置排序和cursor条件
		switch params.Sort {
		case "like":
			query = query.Order("like_count DESC, id DESC").Where("(like_count < (SELECT like_count FROM feed_posts WHERE id = ?) OR (like_count = (SELECT like_count FROM feed_posts WHERE id = ?) AND id < ?))",
				params.AfterID, params.AfterID, params.AfterID)
		case "comment":
			query = query.Order("comment_count DESC, id DESC").Where("(comment_count < (SELECT comment_count FROM feed_posts WHERE id = ?) OR (comment_count = (SELECT comment_count FROM feed_posts WHERE id = ?) AND id < ?))",
				params.AfterID, params.AfterID, params.AfterID)
		default: // "time"
			query = query.Order("created_at DESC, id DESC").Where("(created_at < (SELECT created_at FROM feed_posts WHERE id = ?) OR (created_at = (SELECT created_at FROM feed_posts WHERE id = ?) AND id < ?))",
				params.AfterID, params.AfterID, params.AfterID)
		}
	} else {
		// 无cursor分页，只设置排序
		switch params.Sort {
		case "like":
			query = query.Order("like_count DESC, id DESC")
		case "comment":
			query = query.Order("comment_count DESC, id DESC")
		default: // "time"
			query = query.Order("created_at DESC, id DESC")
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

	// 构建响应项目列表
	responseItems := make([]models.FeedPostResponseItem, len(posts))
	for i, post := range posts {
		item := models.FeedPostResponseItem{
			FeedPost: post,
		}

		// 根据参数决定是否预载评论
		if params.CommentCount > 0 {
			comments, err := s.getCommentsFromCache(fmt.Sprintf("%d", post.ID), params.CommentCount)
			if err == nil && len(comments) > 0 {
				item.PreloadedComments = comments
				item.CommentPreviewCount = len(comments)
			} else {
				// 即使获取评论失败，也要确保字段存在（空数组）
				item.PreloadedComments = []models.FeedComment{}
				item.CommentPreviewCount = 0
			}
		} else {
			// 不预载评论，设置为空数组
			item.PreloadedComments = []models.FeedComment{}
			item.CommentPreviewCount = 0
		}

		responseItems[i] = item
	}

	return responseItems, nextCursor, hasMore, nil
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

// SetFeedPostLike 设置信息流帖子点赞状态
func (s *FeedService) SetFeedPostLike(userID uint64, postID string, isLike bool) (*models.LikeResult, error) {
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

	// 检查当前点赞状态
	var currentLiked bool
	var existingLike models.PostLike
	err = s.DB.Where("post_id = ? AND user_id = ?", postIDUint, userID).
		First(&existingLike).Error
	currentLiked = err == nil

	// 状态无变化，直接返回
	if currentLiked == isLike {
		return &models.LikeResult{Changed: false, IsLiked: isLike}, nil
	}

	// 使用事务处理状态变更
	result := &models.LikeResult{Changed: true, IsLiked: isLike}
	txErr := s.DB.Transaction(func(tx *gorm.DB) error {
		if isLike {
			// 添加点赞记录
			like := models.PostLike{PostID: postIDUint, UserID: userID}
			if err := tx.Create(&like).Error; err != nil {
				return err
			}
			// 增加点赞数
			return tx.Model(&post).UpdateColumn("like_count", gorm.Expr("like_count + 1")).Error
		} else {
			// 删除点赞记录
			if err := tx.Where("post_id = ? AND user_id = ?", postIDUint, userID).
				Delete(&models.PostLike{}).Error; err != nil {
				return err
			}
			// 减少点赞数
			return tx.Model(&post).UpdateColumn("like_count", gorm.Expr("like_count - 1")).Error
		}
	})

	if txErr != nil {
		return nil, txErr
	}

	return result, nil
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

	// 异步清理缓存
	go s.invalidateCommentCache(postID)

	return comment, nil
}

// SetFeedCommentLike 设置信息流评论点赞状态
func (s *FeedService) SetFeedCommentLike(userID uint64, commentID string, isLike bool) (*models.LikeResult, error) {
	commentIDUint, err := s.ParseStringToUint64(commentID)
	if err != nil {
		return nil, err
	}

	// 检查评论是否存在
	var comment models.FeedComment
	if err := s.DB.Where("id = ?", commentIDUint).First(&comment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("comment not found")
		}
		return nil, err
	}

	// 检查用户是否已点赞
	var existingLike models.FeedCommentLike
	err = s.DB.Where("comment_id = ? AND user_id = ?", commentIDUint, userID).First(&existingLike).Error

	result := &models.LikeResult{}

	// 使用事务处理点赞状态设置
	txErr := s.DB.Transaction(func(tx *gorm.DB) error {
		if isLike {
			// 要点赞
			if err == nil {
				// 已点赞，无需操作
				result.Changed = false
				result.IsLiked = true
				return nil
			} else if errors.Is(err, gorm.ErrRecordNotFound) {
				// 未点赞，添加点赞
				newLike := models.FeedCommentLike{
					CommentID: commentIDUint,
					UserID:    userID,
				}
				if err := tx.Create(&newLike).Error; err != nil {
					return err
				}
				// 增加点赞数
				if err := tx.Model(&comment).UpdateColumn("like_count", gorm.Expr("like_count + 1")).Error; err != nil {
					return err
				}
				result.Changed = true
				result.IsLiked = true
				return nil
			} else {
				// 其他数据库错误
				return err
			}
		} else {
			// 要取消点赞
			if err == nil {
				// 已点赞，取消点赞
				if err := tx.Delete(&existingLike).Error; err != nil {
					return err
				}
				// 减少点赞数
				if err := tx.Model(&comment).UpdateColumn("like_count", gorm.Expr("like_count - 1")).Error; err != nil {
					return err
				}
				result.Changed = true
				result.IsLiked = false
				return nil
			} else if errors.Is(err, gorm.ErrRecordNotFound) {
				// 未点赞，无需操作
				result.Changed = false
				result.IsLiked = false
				return nil
			} else {
				// 其他数据库错误
				return err
			}
		}
	})

	if txErr != nil {
		return nil, txErr
	}

	return result, nil
}

// SyncFeedUserProfile 同步用户资料到信息流
func (s *FeedService) SyncFeedUserProfile(userID uint64) error {
	// 获取最新用户信息
	var user models.User
	if err := s.DB.First(&user, userID).Error; err != nil {
		return err
	}

	// 批量更新帖子中的用户信息
	err := s.DB.Model(&models.FeedPost{}).
		Where("user_id = ? AND user_profile_version < ?", userID, user.ProfileVersion).
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
		Where("user_id = ? AND user_profile_version < ?", userID, user.ProfileVersion).
		Updates(map[string]any{
			"username":             user.Username,
			"avatar":               user.Avatar,
			"user_profile_version": user.ProfileVersion,
		}).Error
}

// CleanFeedOrphanData 清理信息流孤儿数据
func (s *FeedService) CleanFeedOrphanData() error {
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
	if err := s.DB.Where("NOT EXISTS (?)", subQuery5).Delete(&models.PostLike{}).Error; err != nil {
		return err
	}

	// 删除评论不存在的评论点赞记录
	subQuery6 := s.DB.Table("feed_comments").Select("id").Where("feed_comments.id = feed_comment_likes.comment_id")
	if err := s.DB.Where("NOT EXISTS (?)", subQuery6).Delete(&models.FeedCommentLike{}).Error; err != nil {
		return err
	}

	// 删除用户不存在的评论点赞记录
	subQuery7 := s.DB.Table("users").Select("id").Where("users.id = feed_comment_likes.user_id")
	return s.DB.Where("NOT EXISTS (?)", subQuery7).Delete(&models.FeedCommentLike{}).Error
}

// ==== 评论缓存相关方法 ====

// getCommentsFromCache 从缓存获取评论，如果缓存未命中则从数据库获取并缓存
func (s *FeedService) getCommentsFromCache(postID string, count int) ([]models.FeedComment, error) {
	ctx := context.Background()
	key := config.FeedCommentCacheKeyPrefix + postID

	// 尝试从缓存获取
	cached, err := s.Redis.Get(ctx, key).Result()
	if err == nil {
		// 缓存命中，解析数据
		var cachedComments []models.FeedComment
		if err := json.Unmarshal([]byte(cached), &cachedComments); err == nil {
			// 返回指定数量的评论
			if len(cachedComments) >= count {
				return cachedComments[:count], nil
			}
			return cachedComments, nil
		}
	}

	// 缓存未命中，从数据库获取
	comments, err := s.getTopCommentsFromDB(postID, config.FeedMaxCachedComments)
	if err != nil {
		return nil, err
	}

	// 异步缓存数据
	go s.cacheComments(postID, comments)

	// 返回指定数量的评论
	if len(comments) >= count {
		return comments[:count], nil
	}
	return comments, nil
}

// getTopCommentsFromDB 从数据库获取指定数量的最新评论
func (s *FeedService) getTopCommentsFromDB(postID string, count int) ([]models.FeedComment, error) {
	var comments []models.FeedComment
	
	err := s.DB.Model(&models.FeedComment{}).
		Where("post_id = ?", postID).
		Order("created_at DESC, id DESC").
		Limit(count).
		Find(&comments).Error
		
	return comments, err
}

// cacheComments 缓存评论数据到Redis
func (s *FeedService) cacheComments(postID string, comments []models.FeedComment) {
	ctx := context.Background()
	key := config.FeedCommentCacheKeyPrefix + postID

	// 限制缓存数量
	if len(comments) > config.FeedMaxCachedComments {
		comments = comments[:config.FeedMaxCachedComments]
	}

	// 序列化为JSON
	data, err := json.Marshal(comments)
	if err != nil {
		return // 序列化失败，忽略缓存
	}

	// 存储到Redis，忽略错误（缓存失败不影响主流程）
	s.Redis.SetEx(ctx, key, data, config.FeedCommentCacheTTL)
}

// invalidateCommentCache 使评论缓存失效
func (s *FeedService) invalidateCommentCache(postID string) {
	ctx := context.Background()
	key := config.FeedCommentCacheKeyPrefix + postID
	
	// 删除缓存，忽略错误
	s.Redis.Del(ctx, key)
}
