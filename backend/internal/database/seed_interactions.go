package database

import (
	"ai-models-backend/internal/models"
	"crypto/rand"
	"math/big"
)

// seedInteractions 创建随机互动数据（点赞）
func (s *SeedManager) seedInteractions(users []models.User, posts []models.FeedPost) error {
	if len(users) == 0 || len(posts) == 0 {
		return nil
	}

	// 生成帖子点赞
	if err := s.seedPostLikes(users, posts); err != nil {
		return err
	}

	// 生成评论点赞
	if err := s.seedCommentLikes(users); err != nil {
		return err
	}

	return nil
}

// seedPostLikes 生成帖子点赞数据
func (s *SeedManager) seedPostLikes(users []models.User, posts []models.FeedPost) error {
	var postLikes []models.PostLike

	for _, post := range posts {
		// 每个帖子随机获得0-15个赞
		likeCount, _ := rand.Int(rand.Reader, big.NewInt(16))
		
		// 随机选择用户进行点赞（避免重复）
		likedUsers := make(map[uint64]bool)
		
		for i := int64(0); i < likeCount.Int64(); i++ {
			// 随机选择用户
			userIdx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(users))))
			user := users[userIdx.Int64()]
			
			// 避免重复点赞
			if likedUsers[user.ID] {
				continue
			}
			likedUsers[user.ID] = true

			like := models.PostLike{
				PostID: post.ID,
				UserID: user.ID,
			}
			postLikes = append(postLikes, like)
		}
	}

	// 批量创建点赞
	if len(postLikes) > 0 {
		if err := DB.Create(&postLikes).Error; err != nil {
			return err
		}
	}

	// 更新帖子的点赞数量
	for _, post := range posts {
		var likeCount int64
		DB.Model(&models.PostLike{}).Where("post_id = ?", post.ID).Count(&likeCount)
		DB.Model(&post).Update("like_count", likeCount)
	}

	return nil
}

// seedCommentLikes 生成评论点赞数据
func (s *SeedManager) seedCommentLikes(users []models.User) error {
	// 获取所有评论
	var comments []models.FeedComment
	if err := DB.Find(&comments).Error; err != nil {
		return err
	}

	var commentLikes []models.FeedCommentLike

	for _, comment := range comments {
		// 每个评论随机获得0-8个赞
		likeCount, _ := rand.Int(rand.Reader, big.NewInt(9))
		
		// 随机选择用户进行点赞（避免重复）
		likedUsers := make(map[uint64]bool)
		
		for i := int64(0); i < likeCount.Int64(); i++ {
			// 随机选择用户
			userIdx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(users))))
			user := users[userIdx.Int64()]
			
			// 避免重复点赞
			if likedUsers[user.ID] {
				continue
			}
			likedUsers[user.ID] = true

			like := models.FeedCommentLike{
				CommentID: comment.ID,
				UserID:    user.ID,
			}
			commentLikes = append(commentLikes, like)
		}
	}

	// 批量创建点赞
	if len(commentLikes) > 0 {
		if err := DB.Create(&commentLikes).Error; err != nil {
			return err
		}
	}

	// 更新评论的点赞数量
	for _, comment := range comments {
		var likeCount int64
		DB.Model(&models.FeedCommentLike{}).Where("comment_id = ?", comment.ID).Count(&likeCount)
		DB.Model(&comment).Update("like_count", likeCount)
	}

	return nil
}