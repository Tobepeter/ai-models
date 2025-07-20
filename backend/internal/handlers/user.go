package handlers

import (
	"ai-models-backend/internal/middleware"
	"ai-models-backend/internal/models"
	"ai-models-backend/internal/services"
	"ai-models-backend/pkg/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// 用户请求处理器
type UserHandler struct {
	userService *services.UserService
}
func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
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

	user, err := h.userService.CreateUser(req)
	if err != nil {
		logrus.Error("Failed to create user:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to create user")
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Username)
	if err != nil {
		logrus.Error("Failed to generate token:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	data := gin.H{
		"user":  user.ToResponse(),
		"token": token,
	}

	response.Success(c, http.StatusCreated, "User registered successfully", data)
}

// 用户登录
func (h *UserHandler) Login(c *gin.Context) {
	var req models.UserLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Error("Invalid request body:", err)
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.userService.AuthenticateUser(req.Username, req.Password)
	if err != nil {
		logrus.Error("Authentication failed:", err)
		response.Error(c, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Username)
	if err != nil {
		logrus.Error("Failed to generate token:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	data := gin.H{
		"user":  user.ToResponse(),
		"token": token,
	}

	response.Success(c, http.StatusOK, "Login successful", data)
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

	response.Success(c, http.StatusOK, "Profile retrieved successfully", user.ToResponse())
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

	response.Success(c, http.StatusOK, "Profile updated successfully", user.ToResponse())
}

// 获取用户列表
func (h *UserHandler) GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	users, total, err := h.userService.GetUsers(page, limit)
	if err != nil {
		logrus.Error("Failed to get users:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to get users")
		return
	}

	data := gin.H{
		"users": users,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	}

	response.Success(c, http.StatusOK, "Users retrieved successfully", data)
}