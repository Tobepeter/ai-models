package handlers

import (
	"ai-models-backend/internal/models"
	"ai-models-backend/internal/services"
	"ai-models-backend/pkg/response"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// 用户请求处理器
type UserHandler struct {
	userService *services.UserService
	authService *services.AuthService
}

func NewUserHandler(userService *services.UserService, authService *services.AuthService) *UserHandler {
	return &UserHandler{
		userService: userService,
		authService: authService,
	}
}

// 用户注册
func (h *UserHandler) Register(c *gin.Context) {
	var req models.UserCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Error("Invalid request body:", err)
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, token, err := h.authService.Register(req)
	if err != nil {
		logrus.Error("Failed to register user:", err)
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	data := gin.H{
		"user":  user.ToResponse(),
		"token": token,
	}

	response.Success(c, data)
}

// 用户登录
func (h *UserHandler) Login(c *gin.Context) {
	var req models.UserLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Error("Invalid request body:", err)
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, token, err := h.authService.Login(req.Username, req.Password)
	if err != nil {
		logrus.Error("Authentication failed:", err)
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	data := gin.H{
		"user":  user.ToResponse(),
		"token": token,
	}

	response.Success(c, data)
}

// 获取用户信息
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not found in context")
		return
	}

	user, err := h.userService.GetUserByID(userID.(uint))
	if err != nil {
		logrus.Error("Failed to get user:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to get user profile")
		return
	}

	response.Success(c, user.ToResponse())
}

// 更新用户信息
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not found in context")
		return
	}

	var req models.UserUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Error("Invalid request body:", err)
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.userService.UpdateUser(userID.(uint), req)
	if err != nil {
		logrus.Error("Failed to update user:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to update profile")
		return
	}

	response.Success(c, user.ToResponse())
}

// 获取用户列表
func (h *UserHandler) GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	data, err := h.userService.GetUsers(page, limit)
	if err != nil {
		logrus.Error("Failed to get users:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to get users")
		return
	}

	response.Success(c, data)
}

// 删除用户
func (h *UserHandler) DeleteUser(c *gin.Context) {
	userID := c.Param("id")
	id, err := strconv.ParseUint(userID, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	if err := h.userService.DeleteUser(uint(id)); err != nil {
		logrus.Error("Failed to delete user:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to delete user")
		return
	}

	response.Success(c, gin.H{"message": "User deleted successfully"})
}

// 根据ID获取用户信息（管理员用）
func (h *UserHandler) GetUserByID(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	user, err := h.userService.GetUserByID(uint(userID))
	if err != nil {
		logrus.Error("Failed to get user:", err)
		response.Error(c, http.StatusNotFound, "User not found")
		return
	}

	response.Success(c, user.ToResponse())
}

// 激活用户
func (h *UserHandler) ActivateUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	if err := h.userService.ActivateUser(uint(userID)); err != nil {
		logrus.Error("Failed to activate user:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to activate user")
		return
	}

	response.Success(c, gin.H{"message": "User activated successfully"})
}

// 停用用户
func (h *UserHandler) DeactivateUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	if err := h.userService.DeactivateUser(uint(userID)); err != nil {
		logrus.Error("Failed to deactivate user:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to deactivate user")
		return
	}

	response.Success(c, gin.H{"message": "User deactivated successfully"})
}

// 修改密码
func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not found in context")
		return
	}

	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Error("Invalid request body:", err)
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.userService.ChangePassword(userID.(uint), req); err != nil {
		logrus.Error("Failed to change password:", err)

		// 根据错误信息返回不同的状态码
		if err.Error() == "原密码错误" {
			response.Error(c, http.StatusBadRequest, "原密码错误")
		} else {
			response.Error(c, http.StatusInternalServerError, "修改密码失败")
		}
		return
	}

	response.Success(c, gin.H{"message": "密码修改成功"})
}

// 用户退出登录
func (h *UserHandler) Logout(c *gin.Context) {
	// 从请求头中提取token
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		response.Error(c, http.StatusBadRequest, "缺少认证头")
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	if token == "" {
		response.Error(c, http.StatusBadRequest, "无效的token格式")
		return
	}

	// 将token添加到黑名单
	h.authService.Logout(token)

	response.Success(c, gin.H{"message": "退出登录成功"})
}
