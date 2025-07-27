package handlers

import (
	"net/http"

	"ai-models-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// BaseHandler provides common functionality for all handlers
type BaseHandler struct{}

// GetUserID retrieves the user ID from the Gin context
// Returns the user ID and a boolean indicating success
func (h *BaseHandler) GetUserID(c *gin.Context) (uint, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not found in context")
		return 0, false
	}
	return userID.(uint), true
}