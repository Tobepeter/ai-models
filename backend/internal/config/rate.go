package config

import "golang.org/x/time/rate"

// RateLimitLevel 限流等级配置
type RateLimitLevel struct {
	Enabled           bool       // 是否启用限流
	RequestsPerSecond rate.Limit // 每秒请求数
	BurstSize         int        // 突发请求容量
}

// 限流等级定义
var (
	// 全局限流开关
	RateLimitEnabled = true

	// Low 限流 - 宽松限制，适用于大部分接口
	LowRateLimit = RateLimitLevel{
		Enabled:           RateLimitEnabled,
		RequestsPerSecond: 50,
		// TEST
		// RequestsPerSecond: 1,
		BurstSize: 100,
	}

	// Mid 限流 - 中等限制，适用于重要接口（如AI）
	MidRateLimit = RateLimitLevel{
		Enabled:           RateLimitEnabled,
		RequestsPerSecond: 10,
		BurstSize:         20,
	}

	// High 限流 - 严格限制，适用于敏感或昂贵操作
	HighRateLimit = RateLimitLevel{
		Enabled:           RateLimitEnabled,
		RequestsPerSecond: 2,
		BurstSize:         5,
	}
)
