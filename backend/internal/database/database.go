package database

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/models"
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Initialize 初始化数据库连接
func Initialize(cfg *config.Config) error {
	var err error

	// 构建 PostgreSQL DSN
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Shanghai",
		cfg.PostgresHost, cfg.PostgresPort, cfg.PostgresUser, cfg.PostgresPassword, cfg.PostgresDB)

	logrus.Infof("正在连接数据库: %s:%s/%s", cfg.PostgresHost, cfg.PostgresPort, cfg.PostgresDB)

	// 配置 GORM
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// 如果是生产环境，减少日志输出
	if cfg.Environment == "production" {
		gormConfig.Logger = logger.Default.LogMode(logger.Error)
	}

	// 连接数据库
	DB, err = gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		return fmt.Errorf("连接数据库失败: %w", err)
	}

	// 配置连接池
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("获取数据库实例失败: %w", err)
	}

	// 设置连接池参数
	sqlDB.SetMaxIdleConns(10)                  // 最大空闲连接数
	sqlDB.SetMaxOpenConns(100)                 // 最大打开连接数
	sqlDB.SetConnMaxLifetime(time.Hour)        // 连接最大生存时间
	sqlDB.SetConnMaxIdleTime(30 * time.Minute) // 连接最大空闲时间

	// 测试连接
	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("数据库连接测试失败: %w", err)
	}

	logrus.Info("数据库连接成功")

	// 自动迁移
	if err := autoMigrate(); err != nil {
		return fmt.Errorf("数据库迁移失败: %w", err)
	}

	logrus.Info("数据库初始化完成")
	return nil
}

// autoMigrate 自动迁移数据库表结构
func autoMigrate() error {
	logrus.Info("开始数据库迁移...")

	err := DB.AutoMigrate(
		&models.User{},
		&models.ConversationHistory{},
	)

	if err != nil {
		return err
	}

	logrus.Info("数据库迁移完成")
	return nil
}

// GetDB 获取数据库实例
func GetDB() *gorm.DB {
	return DB
}

// Close 关闭数据库连接
func Close() error {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}
	return nil
}

// HealthCheck 数据库健康检查
func HealthCheck() error {
	if DB == nil {
		return fmt.Errorf("数据库未初始化")
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("获取数据库实例失败: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("数据库连接失败: %w", err)
	}

	return nil
}
