package services

import (
	"time"

	"github.com/robfig/cron/v3"
	"github.com/sirupsen/logrus"
)

// FeedSyncManager 信息流同步管理器
type FeedSyncManager struct {
	feedService *FeedService
	userService *UserService
	cron        *cron.Cron
}

// NewFeedSyncManager 创建信息流同步管理器
func NewFeedSyncManager(feedService *FeedService, userService *UserService) *FeedSyncManager {
	return &FeedSyncManager{
		feedService: feedService,
		userService: userService,
		cron:        cron.New(),
	}
}

// StartSyncTasks 启动同步任务
func (m *FeedSyncManager) StartSyncTasks() error {
	// 每30秒执行一次用户资料同步检查
	_, err := m.cron.AddFunc("@every 30s", m.syncUserProfiles)
	if err != nil {
		return err
	}

	// 每小时执行一次孤儿数据清理
	_, err = m.cron.AddFunc("@every 1h", m.cleanOrphanData)
	if err != nil {
		return err
	}

	// 每天凌晨2点执行全量数据清理
	_, err = m.cron.AddFunc("0 2 * * *", m.fullDataCleanup)
	if err != nil {
		return err
	}

	m.cron.Start()
	logrus.Info("Feed sync tasks started")
	return nil
}

// StopSyncTasks 停止同步任务
func (m *FeedSyncManager) StopSyncTasks() {
	if m.cron != nil {
		m.cron.Stop()
		logrus.Info("Feed sync tasks stopped")
	}
}

// syncUserProfiles 同步用户资料
func (m *FeedSyncManager) syncUserProfiles() {
	logrus.Debug("Starting user profile sync task")

	// 获取最近更新的用户列表（简化实现）
	// 实际应该有专门的用户更新记录表
	users, err := m.userService.GetRecentlyUpdatedUsers(time.Now().Add(-30 * time.Second))
	if err != nil {
		logrus.WithError(err).Error("Failed to get recently updated users")
		return
	}

	for _, user := range users {
		if err := m.feedService.SyncFeedUserProfile(user.ID); err != nil {
			logrus.WithError(err).WithField("user_id", user.ID).Error("Failed to sync user profile")
		}
	}

	if len(users) > 0 {
		logrus.WithField("count", len(users)).Info("User profiles synced")
	}
}

// cleanOrphanData 清理孤儿数据
func (m *FeedSyncManager) cleanOrphanData() {
	logrus.Debug("Starting orphan data cleanup task")

	if err := m.feedService.CleanFeedOrphanData(); err != nil {
		logrus.WithError(err).Error("Failed to clean orphan data")
		return
	}

	logrus.Info("Orphan data cleanup completed")
}

// fullDataCleanup 全量数据清理
func (m *FeedSyncManager) fullDataCleanup() {
	logrus.Info("Starting full data cleanup task")

	// 清理孤儿数据
	m.cleanOrphanData()

	// 可以添加更多清理逻辑，如：
	// - 清理过期的缓存数据
	// - 清理无效的图片资源
	// - 统计数据重新计算等

	logrus.Info("Full data cleanup completed")
}
