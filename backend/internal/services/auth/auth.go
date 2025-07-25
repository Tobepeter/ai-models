package auth

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/models"
	"errors"

	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Login 用户登录认证
func (s *AuthService) Login(username, password string) (*models.User, string, error) {
	var user models.User

	// 根据用户名或邮箱查找用户
	if err := s.DB.Where("username = ? OR email = ?", username, username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, "", errors.New("用户不存在")
		}
		return nil, "", err
	}

	// 检查用户是否激活
	if !user.IsActive {
		return nil, "", errors.New("用户已被禁用")
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, "", errors.New("密码错误")
	}

	// 生成token
	token, err := s.GenerateToken(user.ID)
	if err != nil {
		return nil, "", err
	}

	return &user, token, nil
}

// Register 用户注册
func (s *AuthService) Register(req models.UserCreateRequest) (*models.User, string, error) {
	// 检查用户名是否已存在
	if s.ExistsByCondition(&models.User{}, map[string]any{"username": req.Username}) {
		return nil, "", errors.New("用户名已存在")
	}

	// 检查邮箱是否已存在
	if s.ExistsByCondition(&models.User{}, map[string]any{"email": req.Email}) {
		return nil, "", errors.New("邮箱已存在")
	}

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}

	user := &models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: string(hashedPassword),
		Role:     models.RoleUser, // 默认角色为普通用户
		IsActive: true,
	}

	// 根据配置决定是否存储明文密码
	if config.UserStorePlainPassword {
		user.PlainPassword = req.Password
	}

	// 保存到数据库
	if err := s.DB.Create(user).Error; err != nil {
		return nil, "", err
	}

	// 生成token
	token, err := s.GenerateToken(user.ID)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

// Logout 退出登录 (将token添加到黑名单)
func (s *AuthService) Logout(tokenString string) {
	// 获取token的过期时间
	claims, err := s.ValidateToken(tokenString)
	if err == nil && claims != nil {
		expiry := claims.ExpiresAt.Time
		blacklist.Add(tokenString, expiry)
	}
}

// CreateDefaultAdmin 创建默认管理员用户
func (s *AuthService) CreateDefaultAdmin() error {
	// 检查是否已存在管理员用户
	var adminCount int64
	if err := s.DB.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&adminCount).Error; err != nil {
		return err
	}

	// 如果已有管理员，跳过创建
	if adminCount > 0 {
		return nil
	}

	// 获取默认管理员配置
	username := s.config.PostgresUser
	password := s.config.PostgresPassword
	email := username + "@localhost" // 使用用户名作为邮箱前缀

	if username == "" || password == "" {
		return errors.New("无法获取默认管理员账号配置")
	}

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// 创建默认管理员用户
	admin := &models.User{
		Username:      username,
		Email:         email,
		Password:      string(hashedPassword),
		PlainPassword: password, // 根据配置决定是否存储
		Role:          models.RoleAdmin,
		IsActive:      true,
	}

	// 保存到数据库
	if err := s.DB.Create(admin).Error; err != nil {
		return err
	}

	logrus.Infof("默认管理员用户已创建: %s", username)
	return nil
}

