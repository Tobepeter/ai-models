package handlers

import (
	"ai-models-backend/internal/models"
	"ai-models-backend/internal/services"
	"ai-models-backend/internal/services/auth"
	"ai-models-backend/pkg/response"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type UserHandler struct {
	BaseHandler
	userService *services.UserService
	authService *auth.AuthService
}

func NewUserHandler(userService *services.UserService, authService *auth.AuthService) *UserHandler {
	return &UserHandler{
		BaseHandler: BaseHandler{},
		userService: userService,
		authService: authService,
	}
}

// @Summary 用户注册
// @Description 新用户注册账号，创建用户账户并返回JWT token，用于后续身份认证
// @ID register
// @Tags Auth
// @Param request body models.UserCreateRequest true "注册请求"
// @Success 200 {object} response.Response{data=models.UserCreateResponse}
// @Router /users/register [post]
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

	data := models.UserCreateResponse{
		User:  user.ToResponse(),
		Token: token,
	}

	response.Success(c, data)
}

// @Summary 用户登录
// @Description 用户使用用户名和密码登录系统，验证成功后返回JWT token和用户信息
// @ID login
// @Tags Auth
// @Param request body models.UserLoginRequest true "登录请求"
// @Success 200 {object} response.Response{data=models.UserLoginResponse}
// @Router /users/login [post]
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

	data := models.UserLoginResponse{
		User:  user.ToResponse(),
		Token: token,
	}

	response.Success(c, data)
}

// GetProfile 获取当前用户信息
// @Summary 获取用户信息
// @Description 获取当前登录用户的个人资料信息，包括基本信息、角色等
// @ID getProfile
// @Tags User
// @Success 200 {object} response.Response{data=models.UserResponse}
// @Failure 401 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /users/profile [get]
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID := c.MustGet("user_id").(uint64)
	user, err := h.userService.GetUserByID(userID)
	if err != nil {
		logrus.Error("Failed to get user:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to get user")
		return
	}

	response.Success(c, user.ToResponse())
}

// @Summary 更新用户信息
// @Description 更新当前登录用户的个人资料，如用户名、邮箱、头像等信息
// @ID updateProfile
// @Tags User
// @Param request body models.UserUpdateRequest true "更新请求"
// @Success 200 {object} response.Response{data=models.UserResponse}
// @Router /users/profile [put]
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, ok := h.GetUserID(c)
	if !ok {
		return
	}

	var req models.UserUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Error("Invalid request body:", err)
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, err := h.userService.UpdateUser(userID, req)
	if err != nil {
		logrus.Error("Failed to update user:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to update profile")
		return
	}

	response.Success(c, user.ToResponse())
}

// @Summary 获取用户列表
// @Description 管理员分页获取系统中所有用户的列表，支持分页查询
// @ID getUsers
// @Tags Admin
// @Param page query int true "页码"
// @Param limit query int true "每页数量"
// @Success 200 {object} response.Response{data=models.PaginationResponse}
// @Router /admin/users [get]
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

// @Summary 删除用户
// @Description 管理员删除指定用户账户，此操作将永久删除用户数据，请谨慎使用
// @ID deleteUser
// @Tags Admin
// @Param id path string true "用户ID"
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /admin/users/{id} [delete]
func (h *UserHandler) DeleteUser(c *gin.Context) {
	userID := c.Param("id")
	id, err := strconv.ParseUint(userID, 10, 64)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	if err := h.userService.DeleteUser(id); err != nil {
		logrus.Error("Failed to delete user:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to delete user")
		return
	}

	response.SuccessMsg(c, "User deleted successfully")
}

// @Summary 根据ID获取用户信息
// @Description 管理员根据用户ID获取指定用户的详细信息，用于用户管理
// @ID getUserByID
// @Tags Admin
// @Param id path string true "用户ID"
// @Success 200 {object} response.Response{data=models.UserResponse}
// @Router /admin/users/{id} [get]
func (h *UserHandler) GetUserByID(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	user, err := h.userService.GetUserByID(userID)
	if err != nil {
		logrus.Error("Failed to get user:", err)
		response.Error(c, http.StatusNotFound, "User not found")
		return
	}

	response.Success(c, user.ToResponse())

}

// @Summary 激活用户
// @Description 管理员激活指定用户账户，激活后用户可以正常登录和使用系统
// @ID activateUser
// @Tags Admin
// @Param id path string true "用户ID"
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /admin/users/{id}/activate [post]
func (h *UserHandler) ActivateUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	if err := h.userService.ActivateUser(userID); err != nil {
		logrus.Error("Failed to activate user:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to activate user")
		return
	}

	response.SuccessMsg(c, "User activated successfully")
}

// @Summary 停用用户
// @Description 管理员停用指定用户账户，停用后用户无法登录和使用系统功能
// @Tags Admin
// @Param id path string true "用户ID"
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /admin/users/{id}/deactivate [post]
func (h *UserHandler) DeactivateUser(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	if err := h.userService.DeactivateUser(userID); err != nil {
		logrus.Error("Failed to deactivate user:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to deactivate user")
		return
	}

	response.SuccessMsg(c, "User deactivated successfully")
}

// @Summary 修改密码
// @Description 用户修改自己的登录密码，需要提供旧密码进行验证
// @Tags User
// @Param request body models.ChangePasswordRequest true "修改密码请求"
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /users/change-password [post]
func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID, ok := h.GetUserID(c)
	if !ok {
		return
	}

	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Error("Invalid request body:", err)
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.userService.ChangePassword(userID, req); err != nil {
		logrus.Error("Failed to change password:", err)

		// 根据错误信息返回不同的状态码
		if err.Error() == "原密码错误" {
			response.Error(c, http.StatusBadRequest, "原密码错误")
		} else {
			response.Error(c, http.StatusInternalServerError, "修改密码失败")
		}
		return
	}

	response.SuccessMsg(c, "密码修改成功")
}

// @Summary 检查用户字段是否存在
// @Description 检查用户对应的字段是否存在（通常是email和username）
// @Tags Auth
// @Param field query string true "字段名"
// @Param value query string true "字段值"
// @Success 200 {object} response.Response{data=bool}
// @Router /users/check-field [get]
func (h *UserHandler) CheckUserField(c *gin.Context) {
	field := c.Query("field")
	value := c.Query("value")

	if field == "" || value == "" {
		response.Error(c, http.StatusBadRequest, "参数不能为空")
		return
	}

	exists := h.userService.CheckUserFieldExist(field, value)
	response.Success(c, exists)
}

// @Summary 用户退出登录
// @Description 用户主动退出登录，清除服务端的登录状态和token
// @Tags Auth
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /users/logout [post]
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

	response.SuccessMsg(c, "退出登录成功")
}
