package services

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/database"
	"ai-models-backend/internal/models"
	"errors"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

/**
 * 用户服务
 * 提供用户相关的业务逻辑处理
 */
type UserService struct {
	BaseService
	config *config.Config
}

func NewUserService(cfg *config.Config) *UserService {
	return &UserService{
		BaseService: BaseService{DB: database.DB},
		config:      cfg,
	}
}

// CreateUser 创建用户
func (s *UserService) CreateUser(req models.UserCreateRequest) (*models.User, error) {
	// 检查用户名是否已存在
	if s.ExistsByCondition(&models.User{}, map[string]any{"username": req.Username}) {
		return nil, errors.New("用户名已存在")
	}

	// 检查邮箱是否已存在
	if s.ExistsByCondition(&models.User{}, map[string]any{"email": req.Email}) {
		return nil, errors.New("邮箱已存在")
	}

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: string(hashedPassword),
		IsActive: true,
	}

	// 根据配置决定是否存储明文密码
	if config.UserStorePlainPassword {
		user.PlainPassword = req.Password
	}

	// 保存到数据库
	if err := s.DB.Create(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}

// GetUserByID 根据ID获取用户
func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	if err := s.DB.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户不存在")
		}
		return nil, err
	}
	return &user, nil
}

// UpdateUser 更新用户信息
func (s *UserService) UpdateUser(id uint, req models.UserUpdateRequest) (*models.User, error) {
	var user models.User
	if err := s.DB.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户不存在")
		}
		return nil, err
	}

	// 检查用户名是否已被其他用户使用
	if req.Username != "" && req.Username != user.Username {
		if s.ExistsByConditionExcludeID(&models.User{}, map[string]any{"username": req.Username}, id) {
			return nil, errors.New("用户名已存在")
		}
		user.Username = req.Username
	}

	// 检查邮箱是否已被其他用户使用
	if req.Email != "" && req.Email != user.Email {
		if s.ExistsByConditionExcludeID(&models.User{}, map[string]any{"email": req.Email}, id) {
			return nil, errors.New("邮箱已存在")
		}
		user.Email = req.Email
	}

	// 更新头像
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}

	// 保存更新
	if err := s.DB.Save(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

// GetUsers 获取用户列表
func (s *UserService) GetUsers(page, limit int) (*models.UserListResponse, error) {
	var users []models.User

	// 使用基础服务的分页方法
	total, err := s.Paginate(&models.User{}, &users, page, limit)
	if err != nil {
		return nil, err
	}

	// 转换为响应格式
	var userResponses []models.UserResponse
	for _, user := range users {
		userResponses = append(userResponses, user.ToResponse())
	}

	// 创建分页响应
	response := &models.UserListResponse{
		Data: userResponses,
		Pagination: models.Pagination{
			Current:  page,
			PageSize: limit,
			Total:    total,
		},
	}

	return response, nil
}

// DeleteUser 删除用户
func (s *UserService) DeleteUser(id uint) error {
	return s.HardDelete(&models.User{}, id)
}

// ActivateUser 启用用户
func (s *UserService) ActivateUser(id uint) error {
	return s.UpdateField(&models.User{}, id, "is_active", true)
}

// DeactivateUser 禁用用户
func (s *UserService) DeactivateUser(id uint) error {
	return s.UpdateField(&models.User{}, id, "is_active", false)
}

// ChangePassword 修改用户密码
func (s *UserService) ChangePassword(userID uint, req models.ChangePasswordRequest) error {
	// 获取用户信息
	var user models.User
	if err := s.DB.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("用户不存在")
		}
		return err
	}

	// 验证旧密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		return errors.New("原密码错误")
	}

	// 加密新密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// 更新密码
	updates := map[string]any{
		"password": string(hashedPassword),
	}

	if config.UserStorePlainPassword {
		updates["plain_password"] = req.NewPassword
	}

	if err := s.DB.Model(&user).Updates(updates).Error; err != nil {
		return err
	}

	return nil
}

// GetUserCount 获取用户总数
func (s *UserService) GetUserCount() (int64, error) {
	var count int64
	err := s.DB.Model(&models.User{}).Count(&count).Error
	return count, err
}

// GetAdminUserCount 获取管理员用户数
func (s *UserService) GetAdminUserCount() (int64, error) {
	var count int64
	err := s.DB.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&count).Error
	return count, err
}

// ResetPassword 重置用户密码
func (s *UserService) ResetPassword(userID string, newPassword string) error {
	// 加密新密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// 更新数据库中的密码
	updateData := map[string]interface{}{
		"password": string(hashedPassword),
	}

	// 根据配置决定是否更新明文密码
	if config.UserStorePlainPassword {
		updateData["plain_password"] = newPassword
	}

	return s.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updateData).Error
}

// IsAdmin 检查用户是否为管理员
func (s *UserService) IsAdmin(userID uint) (bool, error) {
	user, err := s.GetUserByID(userID)
	if err != nil {
		return false, err
	}
	return user.IsAdmin(), nil
}
