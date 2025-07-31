package middleware

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/pkg/response"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// 限流器管理
type rateLimiter struct {
	limiters map[string]*rate.Limiter
	mu       sync.RWMutex
	rps      rate.Limit
	burst    int
}

func newRateLimiter(rps rate.Limit, burst int) *rateLimiter {
	rl := &rateLimiter{
		limiters: make(map[string]*rate.Limiter),
		rps:      rps,
		burst:    burst,
	}
	go rl.cleanup()
	return rl
}

func (rl *rateLimiter) getLimiter(key string) *rate.Limiter {
	rl.mu.RLock()
	limiter, exists := rl.limiters[key]
	rl.mu.RUnlock()

	if !exists {
		rl.mu.Lock()
		if limiter, exists = rl.limiters[key]; !exists {
			limiter = rate.NewLimiter(rl.rps, rl.burst)
			rl.limiters[key] = limiter
		}
		rl.mu.Unlock()
	}
	return limiter
}

func (rl *rateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		rl.mu.Lock()
		if len(rl.limiters) > 1000 {
			rl.limiters = make(map[string]*rate.Limiter)
		}
		rl.mu.Unlock()
	}
}

// 生成限流key
func getKey(c *gin.Context) string {
	// NOTE: 这里允许不存在
	if userID, exists := c.Get("user_id"); exists {
		return fmt.Sprintf("user:%v", userID)
	}
	return "ip:" + c.ClientIP()
}

// 限流中间件核心
func rateLimit(level config.RateLimitLevel) gin.HandlerFunc {
	if !level.Enabled {
		return func(c *gin.Context) { c.Next() }
	}

	limiter := newRateLimiter(level.RequestsPerSecond, level.BurstSize)

	return func(c *gin.Context) {
		key := getKey(c)
		if !limiter.getLimiter(key).Allow() {
			response.Error(c, http.StatusTooManyRequests, "请求过于频繁，请稍后再试")
			c.Abort()
			return
		}
		c.Next()
	}
}

// 简化接口
func RateLimitLow() gin.HandlerFunc {
	return rateLimit(config.LowRateLimit)
}

func RateLimitMid() gin.HandlerFunc {
	return rateLimit(config.MidRateLimit)
}

func RateLimitHigh() gin.HandlerFunc {
	return rateLimit(config.HighRateLimit)
}
