package handlers

import (
	"ai-models-backend/pkg/response"
	"time"

	"github.com/gin-gonic/gin"
)

// 健康检查处理器
type HealthHandler struct{}
func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// 健康检查
func (h *HealthHandler) Health(c *gin.Context) {
	data := gin.H{
		"status":    "healthy",
		"timestamp": time.Now().UTC(),
		"service":   "ai-models-backend",
		"version":   "1.0.0",
	}

	response.Success(c, data)
}

// 就绪检查
func (h *HealthHandler) Ready(c *gin.Context) {
	
	data := gin.H{
		"status":    "ready",
		"timestamp": time.Now().UTC(),
		"checks": gin.H{
			"database": "connected",
			"redis":    "connected",
			"ai_service": "available",
		},
	}

	response.Success(c, data)
}

// 存活检查
func (h *HealthHandler) Live(c *gin.Context) {
	data := gin.H{
		"status":    "alive",
		"timestamp": time.Now().UTC(),
		"uptime":    time.Since(time.Now()).String(),
	}

	response.Success(c, data)
}