package handlers

import (
	"ai-models-backend/internal/services"
	"ai-models-backend/internal/services/auth"
	"ai-models-backend/pkg/response"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// 管理员请求处理器
type AdminHandler struct {
	userService *services.UserService
	authService *auth.AuthService
}

func NewAdminHandler(userService *services.UserService, authService *auth.AuthService) *AdminHandler {
	return &AdminHandler{
		userService: userService,
		authService: authService,
	}
}

// 获取系统状态
func (h *AdminHandler) GetSystemStatus(c *gin.Context) {
	// 获取用户统计
	totalUsers, err := h.userService.GetUserCount()
	if err != nil {
		logrus.Error("Failed to get user count:", err)
		response.Error(c, http.StatusInternalServerError, "获取用户统计失败")
		return
	}

	adminUsers, err := h.userService.GetAdminUserCount()
	if err != nil {
		logrus.Error("Failed to get admin user count:", err)
		response.Error(c, http.StatusInternalServerError, "获取管理员统计失败")
		return
	}

	data := gin.H{
		"total_users": totalUsers,
		"admin_users": adminUsers,
		"system_info": gin.H{
			"version": "1.0.0",
			"status":  "running",
		},
	}

	response.Success(c, data)
}

// 重置用户密码 (管理员功能)
func (h *AdminHandler) ResetUserPassword(c *gin.Context) {
	userID := c.Param("id")

	var req struct {
		NewPassword string `json:"new_password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "请求参数无效")
		return
	}

	err := h.userService.ResetPassword(userID, req.NewPassword)
	if err != nil {
		logrus.Error("Failed to reset password:", err)
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, gin.H{"message": "密码重置成功"})
}
