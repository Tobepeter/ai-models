package database

import (
	"ai-models-backend/internal/config"
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
)

var Redis *redis.Client

// InitializeRedis 初始化Redis连接
func InitializeRedis(cfg *config.Config) error {
	// 构建 Redis 地址
	addr := fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort)
	
	logrus.Infof("正在连接Redis: %s", addr)
	
	// 创建Redis客户端
	Redis = redis.NewClient(&redis.Options{
		Addr:         addr,
		Password:     cfg.RedisPassword,
		DB:           0, // 使用默认数据库
		DialTimeout:  10 * time.Second,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		PoolSize:     10,
		MinIdleConns: 5,
	})

	// 测试连接
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := Redis.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("Redis连接测试失败: %w", err)
	}

	logrus.Info("Redis连接成功")
	return nil
}

// CloseRedis 关闭Redis连接
func CloseRedis() error {
	if Redis != nil {
		return Redis.Close()
	}
	return nil
}

// RedisHealthCheck Redis健康检查
func RedisHealthCheck() error {
	if Redis == nil {
		return fmt.Errorf("Redis未初始化")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	
	if err := Redis.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("Redis连接失败: %w", err)
	}

	return nil
}

