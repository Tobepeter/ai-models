package database

import (
	"ai-models-backend/internal/models"
	"crypto/rand"
	"fmt"
	"math/big"
)

// seedCorePosts 创建核心演示帖子（固定内容）
func (s *SeedManager) seedCorePosts(users []models.User) ([]models.FeedPost, error) {
	if len(users) == 0 {
		return nil, fmt.Errorf("没有用户可用于创建帖子")
	}

	// 固定的演示内容
	corePosts := []models.FeedPost{
		{
			UserID:   users[0].ID,
			Username: users[0].Username,
			Avatar:   users[0].Avatar,
			Status:   users[0].Status,
			Content:  "欢迎来到AI模型平台！这里展示了最新的AI技术，包括文本生成、图像生成、视频生成等多种能力。🎉",
			ImageURL: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
		},
		{
			UserID:   users[1].ID,
			Username: users[1].Username,
			Avatar:   users[1].Avatar,
			Status:   users[1].Status,
			Content:  "今天尝试了新的AI聊天功能，真的很棒！多模型对比让我能够同时体验不同AI的能力。💻",
			ImageURL: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600&fit=crop",
		},
		{
			UserID:   users[2].ID,
			Username: users[2].Username,
			Avatar:   users[2].Avatar,
			Status:   users[2].Status,
			Content:  "分享一下今天生成的AI图像作品，效果超出预期！技术进步真的很快。🎨",
			ImageURL: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop",
		},
		{
			UserID:   users[0].ID,
			Username: users[0].Username,
			Avatar:   users[0].Avatar,
			Status:   users[0].Status,
			Content:  "学习AI开发的第100天，感谢平台提供的丰富功能！从文本到图像，从音频到视频，每个功能都很实用。📚",
		},
		{
			UserID:   users[1].ID,
			Username: users[1].Username,
			Avatar:   users[1].Avatar,
			Status:   users[1].Status,
			Content:  "团队协作项目进展顺利，AI工具大大提升了我们的效率。特别是多模态生成功能！🚀",
			ImageURL: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
		},
	}

	// 设置用户信息版本号
	for i := range corePosts {
		corePosts[i].UserProfileVersion = 1
	}

	// 批量创建帖子
	if err := DB.Create(&corePosts).Error; err != nil {
		return nil, err
	}

	return corePosts, nil
}

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

	// Unsplash图片分类
	categories := []string{
		"technology",
		"nature",
		"city",
		"food",
		"travel",
		"art",
		"sports",
		"books",
		"music",
		"people",
	}

	categoryIdx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(categories))))
	category := categories[categoryIdx.Int64()]

	// 生成随机种子
	seed, _ := rand.Int(rand.Reader, big.NewInt(1000))

	return fmt.Sprintf("https://images.unsplash.com/photo-%d?w=800&h=600&fit=crop&q=80&auto=format&%s",
		1500000000+seed.Int64(), category)
}
