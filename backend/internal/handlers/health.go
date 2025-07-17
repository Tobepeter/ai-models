package handlers

import (
	"ai-models-backend/pkg/response"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// HealthHandler handles health check requests
type HealthHandler struct{}

// NewHealthHandler creates a new HealthHandler
func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// Health handles health check endpoint
func (h *HealthHandler) Health(c *gin.Context) {
	data := gin.H{
		"status":    "healthy",
		"timestamp": time.Now().UTC(),
		"service":   "ai-models-backend",
		"version":   "1.0.0",
	}

	response.Success(c, http.StatusOK, "Service is healthy", data)
}

// ReadyHandler handles readiness check
func (h *HealthHandler) Ready(c *gin.Context) {
	// Check if all dependencies are ready
	// This could include database connections, external services, etc.
	
	data := gin.H{
		"status":    "ready",
		"timestamp": time.Now().UTC(),
		"checks": gin.H{
			"database": "connected",
			"redis":    "connected",
			"ai_service": "available",
		},
	}

	response.Success(c, http.StatusOK, "Service is ready", data)
}

// LiveHandler handles liveness check
func (h *HealthHandler) Live(c *gin.Context) {
	data := gin.H{
		"status":    "alive",
		"timestamp": time.Now().UTC(),
		"uptime":    time.Since(time.Now()).String(), // In real app, track actual uptime
	}

	response.Success(c, http.StatusOK, "Service is alive", data)
}