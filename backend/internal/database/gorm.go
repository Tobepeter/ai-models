package database

import (
	"ai-models-backend/internal/config"
	"log"
	"os"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// GetGormConfig 获取GORM配置
func GetGormConfig(cfg *config.Config) *gorm.Config {

	logLevel := logger.Info
	if cfg.IsProd {
		logLevel = logger.Error
	}

	gormLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold:             time.Second, // 慢查询阈值
			LogLevel:                  logLevel,    // 日志级别
			IgnoreRecordNotFoundError: true,        // 忽略ErrRecordNotFound错误
			Colorful:                  false,       // 是否启用颜色（这里禁用，nodejs日志文件会附带这些信息）
		},
	)

	// 使用vscode go test时候，输出位置是在 `输出`，而不是 `终端`，打印会非常奇怪
	// 而且测试时候所有异常多会打印，建议关掉
	if cfg.IsTest {
		gormLogger = logger.Discard
	}

	return &gorm.Config{
		Logger: gormLogger,
	}
}
