package database

import (
	"ai-models-backend/internal/models"
	"crypto/rand"
	"fmt"
	"math/big"
)

// seedRandomPosts 创建随机帖子
func (s *SeedManager) seedRandomPosts(users []models.User, count int) ([]models.FeedPost, error) {
	if len(users) == 0 {
		return nil, fmt.Errorf("没有用户可用于创建帖子")
	}

	var posts []models.FeedPost

	for range count {
		// 随机选择用户
		userIdx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(users))))
		user := users[userIdx.Int64()]

		// 生成随机内容
		content := s.randomPostContent()
		imageURL := s.randomImageURL()

		post := models.FeedPost{
			UserID:             user.ID,
			Username:           user.Username,
			Avatar:             user.Avatar,
			Status:             user.Status,
			Content:            content,
			ImageURL:           imageURL,
			UserProfileVersion: 1,
		}

		posts = append(posts, post)
	}

	// 批量创建帖子
	if err := DB.Create(&posts).Error; err != nil {
		return nil, err
	}

	return posts, nil
}

// randomPostContent 生成随机帖子内容
func (s *SeedManager) randomPostContent() string {
	templates := []string{
		"今天%s，感觉%s！%s",
		"分享一下%s的经历，%s真的很%s。%s",
		"刚刚完成了%s，%s的感觉真棒！%s",
		"学习%s已经%s了，%s继续努力！%s",
		"和朋友一起%s，%s的时光总是美好的。%s",
		"最近在研究%s，发现%s很有趣。%s",
		"工作中遇到了%s的挑战，但是%s让我成长了很多。%s",
		"生活就像%s，%s才能看到美好。%s",
	}

	activities := []string{"学习编程", "运动健身", "看书学习", "旅行探索", "美食探店", "摄影创作", "音乐练习", "绘画创作", "游戏娱乐", "朋友聚会"}
	feelings := []string{"充实", "快乐", "兴奋", "满足", "放松", "有成就感", "很开心", "很棒", "很有趣", "很满意"}
	adjectives := []string{"有趣", "棒", "好", "精彩", "难忘", "美好", "充实", "值得", "不错", "惊喜"}
	emojis := []string{"😊", "🎉", "💪", "🌟", "❤️", "👍", "🔥", "✨", "🎯", "🚀", "💯", "😎", "🎊", "🌈", "⭐", "💖"}

	// 随机选择模板和填充词
	templateIdx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(templates))))
	activityIdx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(activities))))
	feelingIdx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(feelings))))
	adjIdx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(adjectives))))
	emojiIdx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(emojis))))

	template := templates[templateIdx.Int64()]
	activity := activities[activityIdx.Int64()]
	feeling := feelings[feelingIdx.Int64()]
	adj := adjectives[adjIdx.Int64()]
	emoji := emojis[emojiIdx.Int64()]

	return fmt.Sprintf(template, activity, feeling, adj, emoji)
}

// randomImageURL 随机生成图片URL（30%概率有图片）
func (s *SeedManager) randomImageURL() string {
	// 30%概率有图片
	chance, _ := rand.Int(rand.Reader, big.NewInt(100))
	if chance.Int64() > 30 {
		return ""
	}

	// 生成随机种子
	seed, _ := rand.Int(rand.Reader, big.NewInt(1000))

	return fmt.Sprintf("https://picsum.photos/800/600?random=%d", seed.Int64())
}
