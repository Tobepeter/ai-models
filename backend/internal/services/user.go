package services

import (
	"ai-models-backend/internal/models"
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// 用户服务
type UserService struct {
}
func NewUserService() *UserService {
	return &UserService{
		// users: make(map[uint]*models.User),
	}
}

// 创建用户
func (s *UserService) CreateUser(req models.UserCreateRequest) (*models.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		ID:        uint(time.Now().UnixNano()), // Simple ID generation for demo
		Username:  req.Username,
		Email:     req.Email,
		Password:  string(hashedPassword),
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}


	return user, nil
}

// 用户认证
func (s *UserService) AuthenticateUser(username, password string) (*models.User, error) {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	
	user := &models.User{
		ID:        1,
		Username:  username,
		Email:     username + "@example.com",
		Password:  string(hashedPassword),
		IsActive:  true,
		CreatedAt: time.Now().Add(-24 * time.Hour),
		UpdatedAt: time.Now(),
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}

// 根据ID获取用户
func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	
	user := &models.User{
		ID:        id,
		Username:  "demo_user",
		Email:     "demo@example.com",
		Avatar:    "https://example.com/avatar.jpg",
		IsActive:  true,
		CreatedAt: time.Now().Add(-24 * time.Hour),
		UpdatedAt: time.Now(),
	}

	return user, nil
}

// 更新用户信息
func (s *UserService) UpdateUser(id uint, req models.UserUpdateRequest) (*models.User, error) {
	
	user := &models.User{
		ID:        id,
		Username:  req.Username,
		Email:     req.Email,
		Avatar:    req.Avatar,
		IsActive:  true,
		CreatedAt: time.Now().Add(-24 * time.Hour),
		UpdatedAt: time.Now(),
	}

	if req.Username == "" {
		user.Username = "demo_user"
	}
	if req.Email == "" {
		user.Email = "demo@example.com"
	}
	if req.Avatar == "" {
		user.Avatar = "https://example.com/avatar.jpg"
	}

	return user, nil
}

// 获取用户列表
func (s *UserService) GetUsers(page, limit int) ([]models.UserResponse, int64, error) {
	
	users := []models.UserResponse{
		{
			ID:        1,
			Username:  "user1",
			Email:     "user1@example.com",
			Avatar:    "https://example.com/avatar1.jpg",
			IsActive:  true,
			CreatedAt: time.Now().Add(-48 * time.Hour),
			UpdatedAt: time.Now().Add(-24 * time.Hour),
		},
		{
			ID:        2,
			Username:  "user2",
			Email:     "user2@example.com",
			Avatar:    "https://example.com/avatar2.jpg",
			IsActive:  true,
			CreatedAt: time.Now().Add(-72 * time.Hour),
			UpdatedAt: time.Now().Add(-12 * time.Hour),
		},
	}

	return users, int64(len(users)), nil
}

// 删除用户
func (s *UserService) DeleteUser(id uint) error {
	return nil
}

// 激活用户
func (s *UserService) ActivateUser(id uint) error {
	return nil
}

// 停用用户
func (s *UserService) DeactivateUser(id uint) error {
	return nil
}