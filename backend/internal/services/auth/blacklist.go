package auth

import (
	"sync"
	"time"
)

// TokenBlacklist Token黑名单 (简单内存实现，生产环境建议使用Redis)
type TokenBlacklist struct {
	tokens map[string]time.Time
	mu     sync.RWMutex
}

var blacklist = &TokenBlacklist{
	tokens: make(map[string]time.Time),
}

// Add 添加token到黑名单
func (b *TokenBlacklist) Add(tokenString string, expiry time.Time) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.tokens[tokenString] = expiry
}

// IsBlacklisted 检查token是否在黑名单中
func (b *TokenBlacklist) IsBlacklisted(tokenString string) bool {
	b.mu.RLock()
	defer b.mu.RUnlock()
	expiry, exists := b.tokens[tokenString]
	if !exists {
		return false
	}
	// 如果token已过期，从黑名单中删除
	if time.Now().After(expiry) {
		delete(b.tokens, tokenString)
		return false
	}
	return true
}

// Cleanup 清理过期的黑名单token (可以在定时任务中调用)
func (b *TokenBlacklist) Cleanup() {
	b.mu.Lock()
	defer b.mu.Unlock()
	now := time.Now()
	for token, expiry := range b.tokens {
		if now.After(expiry) {
			delete(b.tokens, token)
		}
	}
}
