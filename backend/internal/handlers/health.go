package handlers

import (
	"ai-models-backend/internal/database"
	"ai-models-backend/pkg/response"
	"time"

	"ai-models-backend/internal/models"

	"github.com/gin-gonic/gin"
)

type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// Health 健康检查
func (h *HealthHandler) Health(c *gin.Context) {
	data := models.HealthResponse{
		Status:      "healthy",
		Timestamp:   time.Now().UTC().Format(time.RFC3339),
		Service:     "ai-models-backend",
		Version:     "1.0.0",
		Description: "应用程序运行正常",
		Message:     "系统健康状态良好",
	}

	response.Success(c, data)
}

// Ready 就绪检查
func (h *HealthHandler) Ready(c *gin.Context) {
	checks := make(map[string]any)

	// 数据库健康检查
	if err := database.HealthCheck(); err != nil {
		checks["database"] = "failed"
	} else {
		checks["database"] = "connected"
	}

	// Redis健康检查
	if err := database.RedisHealthCheck(); err != nil {
		checks["redis"] = "failed"
	} else {
		checks["redis"] = "connected"
	}

	data := models.ReadyResponse{
		Status:      "ready",
		Timestamp:   time.Now().UTC().Format(time.RFC3339),
		Description: "应用程序已就绪，所有依赖服务正常",
		Message:     "系统就绪状态检查通过",
		Checks:      checks,
	}

	response.Success(c, data)
}

// Live 存活检查
func (h *HealthHandler) Live(c *gin.Context) {
	data := models.LiveResponse{
		Status:      "alive",
		Timestamp:   time.Now().UTC().Format(time.RFC3339),
		Uptime:      time.Since(time.Now()).String(),
		Description: "应用程序存活检查",
		Message:     "系统存活状态正常",
	}

	response.Success(c, data)
}
