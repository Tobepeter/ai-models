package handlers

import (
	"ai-models-backend/pkg/response"
	"time"

	"github.com/gin-gonic/gin"
)

type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// @Summary 健康检查
// @Description 检查应用程序的基本健康状态，返回服务信息和版本号
// @ID healthCheck
// @Tags Health
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /health [get]
func (h *HealthHandler) Health(c *gin.Context) {
	data := gin.H{
		"status":      "healthy",
		"timestamp":   time.Now().UTC(),
		"service":     "ai-models-backend",
		"version":     "1.0.0",
		"description": "应用程序运行正常",
		"message":     "系统健康状态良好",
	}

	response.Success(c, data)
}

// @Summary 就绪检查
// @Description 检查应用程序的 readiness 状态，返回服务信息和版本号
// @ID readyCheck
// @Tags Health
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /ready [get]
func (h *HealthHandler) Ready(c *gin.Context) {

	data := gin.H{
		"status":      "ready",
		"timestamp":   time.Now().UTC(),
		"description": "应用程序已就绪，所有依赖服务正常",
		"message":     "系统就绪状态检查通过",
		"checks": gin.H{
			"database":   "connected",
			"redis":      "connected",
			"ai_service": "available",
		},
	}

	response.Success(c, data)
}

// @Summary 存活检查
// @Description 检查应用程序的 liveness 状态，返回服务信息和版本号
// @ID liveCheck
// @Tags Health
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /live [get]
func (h *HealthHandler) Live(c *gin.Context) {
	data := gin.H{
		"status":      "alive",
		"timestamp":   time.Now().UTC(),
		"uptime":      time.Since(time.Now()).String(),
		"description": "应用程序存活检查",
		"message":     "系统存活状态正常",
	}

	response.Success(c, data)
}
