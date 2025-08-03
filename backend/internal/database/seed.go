package database

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/models"

	"github.com/sirupsen/logrus"
)

/**
 * 种子数据管理器
 */
type SeedManager struct {
	cfg *config.Config
}

// NewSeedManager 创建种子数据管理器
func NewSeedManager(cfg *config.Config) *SeedManager {
	return &SeedManager{cfg: cfg}
}

// RunAllSeeds 运行所有种子数据生成（仅开发环境）
func (s *SeedManager) RunAllSeeds() error {
	// 仅在开发环境运行
	if s.cfg.IsProd {
		logrus.Info("生产环境跳过种子数据生成")
		return nil
	}

	logrus.Info("开始检查并生成种子数据...")

	// 检查用户数量，只有<=1个用户时才创建测试用户（保留管理员）
	var userCount int64
	if err := DB.Model(&models.User{}).Count(&userCount).Error; err != nil {
		return err
	}

	var allUsers []models.User
	if userCount <= 1 {
		// 创建测试用户
		testUsers, err := s.seedTestUsers()
		if err != nil {
			return err
		}
		allUsers = append(allUsers, testUsers...)

		// 创建随机用户
		randomUsers, err := s.seedRandomUsers(20)
		if err != nil {
			return err
		}
		allUsers = append(allUsers, randomUsers...)
	} else {
		// 获取现有用户用于其他数据生成
		if err := DB.Find(&allUsers).Error; err != nil {
			return err
		}
	}

	// 检查posts数量，为空才创建
	var postCount int64
	if err := DB.Model(&models.FeedPost{}).Count(&postCount).Error; err != nil {
		return err
	}

	var allPosts []models.FeedPost
	if postCount == 0 && len(allUsers) > 0 {
		// 只生成随机posts
		randomPosts, err := s.seedRandomPosts(allUsers, 100)
		if err != nil {
			return err
		}
		allPosts = append(allPosts, randomPosts...)
	} else {
		// 获取现有posts
		if err := DB.Find(&allPosts).Error; err != nil {
			return err
		}
	}

	// 检查评论数量，为空才创建
	var commentCount int64
	if err := DB.Model(&models.FeedComment{}).Count(&commentCount).Error; err != nil {
		return err
	}

	if commentCount == 0 && len(allUsers) > 0 && len(allPosts) > 0 {
		if err := s.seedComments(allUsers, allPosts, 300); err != nil {
			return err
		}
	}

	// 检查点赞数量，为空才创建
	var likeCount int64
	if err := DB.Model(&models.PostLike{}).Count(&likeCount).Error; err != nil {
		return err
	}

	if likeCount == 0 && len(allUsers) > 0 && len(allPosts) > 0 {
		if err := s.seedInteractions(allUsers, allPosts); err != nil {
			return err
		}
	}

	logrus.Info("种子数据检查完成")
	return nil
}

