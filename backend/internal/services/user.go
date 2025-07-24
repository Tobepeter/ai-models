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
		BaseService: BaseService{db: database.DB},
		config:      cfg,
	}
}

// 创建用户 (内部使用，不包含认证逻辑)
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
	if err := s.db.Create(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}

// 根据ID获取用户
func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户不存在")
		}
		return nil, err
	}
	return &user, nil
}

// 更新用户信息
func (s *UserService) UpdateUser(id uint, req models.UserUpdateRequest) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, id).Error; err != nil {
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
	if err := s.db.Save(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

// 获取用户列表
func (s *UserService) GetUsers(page, limit int) (map[string]any, error) {
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

	// 使用基础服务创建标准分页响应
	return s.CreatePageResp(userResponses, page, limit, total), nil
}

// DeleteUser 硬删除用户
func (s *UserService) DeleteUser(id uint) error {
	return s.HardDelete(&models.User{}, id)
}

// ActivateUser 激活用户
func (s *UserService) ActivateUser(id uint) error {
	return s.UpdateField(&models.User{}, id, "is_active", true)
}

// DeactivateUser 停用用户
func (s *UserService) DeactivateUser(id uint) error {
	return s.UpdateField(&models.User{}, id, "is_active", false)
}

// ChangePassword 修改密码
func (s *UserService) ChangePassword(userID uint, req models.ChangePasswordRequest) error {
	// 获取用户信息
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
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

	if err := s.db.Model(&user).Updates(updates).Error; err != nil {
		return err
	}

	return nil
}
