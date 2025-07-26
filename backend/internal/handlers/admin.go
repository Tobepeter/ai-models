package handlers

import (
	"ai-models-backend/internal/services"
	"ai-models-backend/internal/services/auth"
	"ai-models-backend/pkg/response"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

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

// @Summary 获取系统状态
// @Description 获取系统运行状态信息，包括用户统计数据和系统基本信息，用于管理员监控
// @Tags Admin
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /admin/status [get]
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

// @Summary 重置用户密码
// @Description 管理员重置指定用户的密码，通常用于用户忘记密码或管理员主动重置的场景
// @Tags Admin
// @Param id path string true "用户ID"
// @Param request body object{new_password=string} true "新密码"
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /admin/users/{id}/reset-password [post]
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
