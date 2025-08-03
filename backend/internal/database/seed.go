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

	logrus.Info("开始生成种子数据...")

	// 清理现有数据
	if err := s.clearExistingData(); err != nil {
		return err
	}

	// 固定用户
	coreUsers, err := s.seedCoreUsers()
	if err != nil {
		return err
	}

	// 随机用户
	randomUsers, err := s.seedRandomUsers(20)
	if err != nil {
		return err
	}

	allUsers := append(coreUsers, randomUsers...)

	// 固定post
	corePosts, err := s.seedCorePosts(coreUsers)
	if err != nil {
		return err
	}

	// 随机post
	randomPosts, err := s.seedRandomPosts(randomUsers, 100)
	if err != nil {
		return err
	}

	allPosts := append(corePosts, randomPosts...)

	// 评论
	if err := s.seedComments(allUsers, allPosts, 300); err != nil {
		return err
	}

	// 随机点赞
	if err := s.seedInteractions(allUsers, allPosts); err != nil {
		return err
	}

	logrus.Info("种子数据生成完成")
	return nil
}

// clearExistingData 清理现有数据（开发环境安全操作）
func (s *SeedManager) clearExistingData() error {
	if s.cfg.IsProd {
		return nil // 生产环境不清理
	}

	logrus.Info("清理现有数据...")

	// 按外键依赖关系逆序删除
	tables := []any{
		&models.FeedCommentLike{},
		&models.PostLike{},
		&models.FeedComment{},
		&models.FeedPost{},
	}

	for _, table := range tables {
		if err := DB.Unscoped().Where("1 = 1").Delete(table).Error; err != nil {
			return err
		}
	}

	// User 表单独处理：只删除非管理员用户，保护所有管理员角色账户
	if err := DB.Unscoped().Where("role != ?", models.RoleAdmin).Delete(&models.User{}).Error; err != nil {
		return err
	}

	logrus.Info("数据清理完成")
	return nil
}
