package testutil

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/database"
	"fmt"
	"testing"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

var TestDB *gorm.DB
var TestConfig *config.Config

// SetupTestDB 初始化测试环境，包括加载配置、连接数据库和执行迁移
func SetupTestDB(t *testing.T) {
	TestConfig = LoadTestEnv(t)

	if err := database.Initialize(TestConfig); err != nil {
		t.Fatalf("初始化测试数据库失败: %v", err)
	}

	TestDB = database.DB
	logrus.Info("测试数据库设置完成")
}

// CleanupTestDB 清空所有测试表数据，重置自增ID，确保测试间数据隔离
func CleanupTestDB(t *testing.T) {

	if TestDB == nil {
		return
	}

	// NOTE：暂时不允许清空，我有超级用户也给删除了

	tables := []string{
		// "feed_comment_likes",
		// "post_likes",
		// "feed_comments",
		// "feed_posts",
		// "users",
		// "conversation_histories",
	}

	for _, table := range tables {
		if err := TestDB.Exec(fmt.Sprintf("TRUNCATE TABLE %s RESTART IDENTITY CASCADE", table)).Error; err != nil {
			t.Logf("清理表 %s 失败: %v", table, err)
		}
	}

	logrus.Info("测试数据库清理完成")
}

// TeardownTestDB 安全关闭数据库连接，释放资源
func TeardownTestDB(t *testing.T) {
	if TestDB != nil {
		sqlDB, err := TestDB.DB()
		if err == nil {
			sqlDB.Close()
		}
	}
	logrus.Info("测试数据库连接已关闭")
}

// RunWithTestDB 提供完整的测试数据库生命周期管理，自动处理设置和清理
func RunWithTestDB(t *testing.T, testFunc func(t *testing.T)) {
	SetupTestDB(t)

	defer TeardownTestDB(t)

	// 有需要可以使用一个专用测试的数据库本地的，不过目前暂时不需要
	// NOTE: 暂时不清理，一般是测试代码处理, 如果有脏数据测时候也可以看到
	// defer CleanupTestDB(t)

	testFunc(t)
}

// RunWithEnv 只加载环境变量，不连接数据库，适用于不依赖数据库的测试
func RunWithEnv(t *testing.T, testFunc func(t *testing.T)) {
	TestConfig = LoadTestEnv(t)
	logrus.Info("环境变量加载完成")
	testFunc(t)
}
