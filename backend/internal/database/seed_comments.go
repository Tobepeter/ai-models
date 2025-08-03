package database

import (
	"ai-models-backend/internal/models"
	"crypto/rand"
	"fmt"
	"math/big"
)

// seedComments 创建随机评论
func (s *SeedManager) seedComments(users []models.User, posts []models.FeedPost, count int) error {
	if len(users) == 0 || len(posts) == 0 {
		return fmt.Errorf("需要用户和帖子数据才能创建评论")
	}

	var comments []models.FeedComment

	for range count {
		// 随机选择用户和帖子
		userIdx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(users))))
		postIdx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(posts))))

		user := users[userIdx.Int64()]
		post := posts[postIdx.Int64()]

		// 生成评论内容
		content := s.randomCommentContent()

		// 概率是回复评论
		var replyTo string
		replayChance := int64(20)
		replyChance, _ := rand.Int(rand.Reader, big.NewInt(100))
		if replyChance.Int64() < replayChance && len(comments) > 0 {
			// 随机选择一个已有评论进行回复
			existingCommentIdx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(comments))))
			existingComment := comments[existingCommentIdx.Int64()]
			// 只回复同一个帖子的评论
			if existingComment.PostID == post.ID {
				replyTo = existingComment.Username
			}
		}

		comment := models.FeedComment{
			PostID:             post.ID,
			UserID:             user.ID,
			Username:           user.Username,
			Avatar:             user.Avatar,
			Content:            content,
			ReplyTo:            replyTo,
			UserProfileVersion: 1,
		}

		comments = append(comments, comment)
	}

	// 批量创建评论
	if err := DB.Create(&comments).Error; err != nil {
		return err
	}

	// 更新帖子的评论数量
	for _, post := range posts {
		var commentCount int64
		DB.Model(&models.FeedComment{}).Where("post_id = ?", post.ID).Count(&commentCount)
		DB.Model(&post).Update("comment_count", commentCount)
	}

	return nil
}

// randomCommentContent 生成随机评论内容
func (s *SeedManager) randomCommentContent() string {
	positiveComments := []string{
		"很赞！👍",
		"说得太好了！",
		"完全同意你的观点！",
		"学到了很多，谢谢分享！",
		"这个想法很棒！💡",
		"期待更多这样的内容！",
		"写得很好，收藏了！",
		"有同感，支持！",
		"真是太棒了！🎉",
		"感谢分享，很有帮助！",
		"这个观点很新颖！",
		"确实如此，深有体会！",
		"很有启发性！",
		"说到心里去了！❤️",
		"受教了，谢谢！",
	}

	questionComments := []string{
		"请问具体怎么操作呢？",
		"能详细说说吗？",
		"有推荐的资源吗？",
		"这个过程难吗？",
		"需要什么准备工作？",
		"有什么注意事项吗？",
		"大概需要多长时间？",
		"成本高吗？",
		"适合新手吗？",
		"有类似的经历可以分享吗？",
	}

	shareComments := []string{
		"我也有类似的经历！",
		"之前也遇到过这种情况。",
		"我的经验是...",
		"补充一点：",
		"从另一个角度来看：",
		"还有一种方法是：",
		"我觉得还可以这样：",
		"个人建议：",
		"根据我的经验：",
		"不妨试试这个方法：",
	}

	// 随机选择评论类型
	typeChoice, _ := rand.Int(rand.Reader, big.NewInt(3))

	var selectedComments []string
	switch typeChoice.Int64() {
	case 0:
		selectedComments = positiveComments
	case 1:
		selectedComments = questionComments
	default:
		selectedComments = shareComments
	}

	// 随机选择具体内容
	commentIdx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(selectedComments))))
	return selectedComments[commentIdx.Int64()]
}
