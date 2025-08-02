package handlers

import (
	"ai-models-backend/internal/database"
	"ai-models-backend/pkg/response"
	"context"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type MetricsHandler struct {
	redis *redis.Client
}

func NewMetricsHandler() *MetricsHandler {
	return &MetricsHandler{
		redis: database.Redis,
	}
}

// RedisMetricsResponse Redis监控指标响应
type RedisMetricsResponse struct {
	Memory RedisMemoryInfo `json:"memory"`
	Stats  RedisStatsInfo  `json:"stats"`
	Keys   RedisKeysInfo   `json:"keys"`
}

type RedisMemoryInfo struct {
	UsedMemory    int64   `json:"used_memory"`     // 已使用内存（字节）
	MaxMemory     int64   `json:"max_memory"`      // 最大内存（字节）
	UsagePercent  float64 `json:"usage_percent"`   // 使用百分比
	FragmentRatio float64 `json:"fragment_ratio"`  // 内存碎片率
}

type RedisStatsInfo struct {
	HitRate         float64 `json:"hit_rate"`          // 缓存命中率
	MissRate        float64 `json:"miss_rate"`         // 缓存未命中率
	KeyspaceHits    int64   `json:"keyspace_hits"`     // 缓存命中次数
	KeyspaceMisses  int64   `json:"keyspace_misses"`   // 缓存未命中次数
	ConnectedClients int64  `json:"connected_clients"` // 连接的客户端数量
}

type RedisKeysInfo struct {
	TotalKeys           int64 `json:"total_keys"`             // 总键数量
	CommentCacheKeys    int64 `json:"comment_cache_keys"`     // 评论缓存键数量
	ExpiredKeys         int64 `json:"expired_keys"`           // 过期键数量
}

// RedisMetrics 获取Redis监控指标
// @Summary 获取Redis监控指标
// @Description 获取Redis内存使用、缓存命中率等监控指标
// @Tags metrics
// @Accept json
// @Produce json
// @Success 200 {object} response.Response{data=RedisMetricsResponse}
// @Router /metrics/redis [get]
func (h *MetricsHandler) RedisMetrics(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 获取Redis INFO信息
	info, err := h.redis.Info(ctx, "memory", "stats", "keyspace").Result()
	if err != nil {
		response.Error(c, 500, "获取Redis信息失败: "+err.Error())
		return
	}

	// 解析内存信息
	memoryInfo := h.parseMemoryInfo(info)
	
	// 解析统计信息
	statsInfo := h.parseStatsInfo(info)
	
	// 解析键信息
	keysInfo, err := h.parseKeysInfo(ctx)
	if err != nil {
		response.Error(c, 500, "获取键信息失败: "+err.Error())
		return
	}

	data := RedisMetricsResponse{
		Memory: memoryInfo,
		Stats:  statsInfo,
		Keys:   keysInfo,
	}

	response.Success(c, data)
}

// parseMemoryInfo 解析内存信息
func (h *MetricsHandler) parseMemoryInfo(info string) RedisMemoryInfo {
	usedMemory := h.extractInfoValue(info, "used_memory")
	maxMemory := h.extractInfoValue(info, "maxmemory")
	fragRatio := h.extractInfoValueFloat(info, "mem_fragmentation_ratio")

	var usagePercent float64
	if maxMemory > 0 {
		usagePercent = float64(usedMemory) / float64(maxMemory) * 100
	}

	return RedisMemoryInfo{
		UsedMemory:    usedMemory,
		MaxMemory:     maxMemory,
		UsagePercent:  usagePercent,
		FragmentRatio: fragRatio,
	}
}

// parseStatsInfo 解析统计信息
func (h *MetricsHandler) parseStatsInfo(info string) RedisStatsInfo {
	keyspaceHits := h.extractInfoValue(info, "keyspace_hits")
	keyspaceMisses := h.extractInfoValue(info, "keyspace_misses")
	connectedClients := h.extractInfoValue(info, "connected_clients")

	var hitRate, missRate float64
	total := keyspaceHits + keyspaceMisses
	if total > 0 {
		hitRate = float64(keyspaceHits) / float64(total) * 100
		missRate = float64(keyspaceMisses) / float64(total) * 100
	}

	return RedisStatsInfo{
		HitRate:         hitRate,
		MissRate:        missRate,
		KeyspaceHits:    keyspaceHits,
		KeyspaceMisses:  keyspaceMisses,
		ConnectedClients: connectedClients,
	}
}

// parseKeysInfo 解析键信息
func (h *MetricsHandler) parseKeysInfo(ctx context.Context) (RedisKeysInfo, error) {
	// 获取总键数
	totalKeys, err := h.redis.DBSize(ctx).Result()
	if err != nil {
		return RedisKeysInfo{}, err
	}

	// 统计评论缓存键数量
	commentKeys, err := h.redis.Keys(ctx, "feed:comments:*").Result()
	if err != nil {
		return RedisKeysInfo{}, err
	}

	return RedisKeysInfo{
		TotalKeys:        totalKeys,
		CommentCacheKeys: int64(len(commentKeys)),
		ExpiredKeys:      0, // Redis不直接提供此信息
	}, nil
}

// extractInfoValue 从INFO字符串中提取数值
func (h *MetricsHandler) extractInfoValue(info, key string) int64 {
	// 简单解析Redis INFO格式
	// 查找格式为 "key:value" 的行
	lines := []string{}
	current := ""
	for _, char := range info {
		if char == '\n' || char == '\r' {
			if current != "" {
				lines = append(lines, current)
				current = ""
			}
		} else {
			current += string(char)
		}
	}
	if current != "" {
		lines = append(lines, current)
	}

	for _, line := range lines {
		if len(line) > len(key)+1 && line[:len(key)+1] == key+":" {
			valueStr := line[len(key)+1:]
			if value, err := strconv.ParseInt(valueStr, 10, 64); err == nil {
				return value
			}
		}
	}
	return 0
}

// extractInfoValueFloat 从INFO字符串中提取浮点数值
func (h *MetricsHandler) extractInfoValueFloat(info, key string) float64 {
	// 简单解析Redis INFO格式
	lines := []string{}
	current := ""
	for _, char := range info {
		if char == '\n' || char == '\r' {
			if current != "" {
				lines = append(lines, current)
				current = ""
			}
		} else {
			current += string(char)
		}
	}
	if current != "" {
		lines = append(lines, current)
	}

	for _, line := range lines {
		if len(line) > len(key)+1 && line[:len(key)+1] == key+":" {
			valueStr := line[len(key)+1:]
			if value, err := strconv.ParseFloat(valueStr, 64); err == nil {
				return value
			}
		}
	}
	return 0.0
}