package services

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/database"
	"ai-models-backend/internal/models"
	"errors"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

/**
 * 认证服务
 * 提供JWT token生成、验证等认证相关的业务逻辑
 */
type AuthService struct {
	BaseService
	config *config.Config
}

// JWT 声明
type JWTClaims struct {
	UserID uint `json:"user_id"`
	jwt.RegisteredClaims
}

// Token黑名单 (简单内存实现，生产环境建议使用Redis)
type TokenBlacklist struct {
	tokens map[string]time.Time
	mu     sync.RWMutex
}

var blacklist = &TokenBlacklist{
	tokens: make(map[string]time.Time),
}

// 添加token到黑名单
func (b *TokenBlacklist) Add(tokenString string, expiry time.Time) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.tokens[tokenString] = expiry
}

// 检查token是否在黑名单中
func (b *TokenBlacklist) IsBlacklisted(tokenString string) bool {
	b.mu.RLock()
	defer b.mu.RUnlock()
	expiry, exists := b.tokens[tokenString]
	if !exists {
		return false
	}
	// 如果token已过期，从黑名单中删除
	if time.Now().After(expiry) {
		delete(b.tokens, tokenString)
		return false
	}
	return true
}

// 清理过期的黑名单token (可以在定时任务中调用)
func (b *TokenBlacklist) Cleanup() {
	b.mu.Lock()
	defer b.mu.Unlock()
	now := time.Now()
	for token, expiry := range b.tokens {
		if now.After(expiry) {
			delete(b.tokens, token)
		}
	}
}

func NewAuthService(cfg *config.Config) *AuthService {
	return &AuthService{
		BaseService: BaseService{db: database.DB},
		config:      cfg,
	}
}

// 生成JWT token
func (s *AuthService) GenerateToken(userID uint) (string, error) {
	claims := JWTClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.config.JWTExpiration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "ai-models-backend",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.getJWTSecret()))
}

// 验证JWT token
func (s *AuthService) ValidateToken(tokenString string) (*JWTClaims, error) {
	// 检查token是否在黑名单中
	if blacklist.IsBlacklisted(tokenString) {
		return nil, errors.New("token已失效")
	}

	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (any, error) {
		// 方法类型必须是 HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(s.getJWTSecret()), nil
	})

	if err != nil {
		return nil, err
	}

	// token必须是指定的Claims类型
	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrTokenMalformed
}

// 用户登录认证
func (s *AuthService) Login(username, password string) (*models.User, string, error) {
	var user models.User

	// 根据用户名或邮箱查找用户
	if err := s.db.Where("username = ? OR email = ?", username, username).First(&user).Error; err != nil {
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

// 用户注册
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
	if err := s.db.Create(user).Error; err != nil {
		return nil, "", err
	}

	// 生成token
	token, err := s.GenerateToken(user.ID)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

// 检查用户是否为管理员
func (s *AuthService) IsAdmin(userID uint) (bool, error) {
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, errors.New("用户不存在")
		}
		return false, err
	}

	return user.IsAdmin(), nil
}

// 刷新token
func (s *AuthService) RefreshToken(oldToken string) (string, error) {
	claims, err := s.ValidateToken(oldToken)
	if err != nil {
		return "", err
	}

	// 生成新的token
	return s.GenerateToken(claims.UserID)
}

// 退出登录 (将token添加到黑名单)
func (s *AuthService) Logout(tokenString string) {
	// 获取token的过期时间
	claims, err := s.ValidateToken(tokenString)
	if err == nil && claims != nil {
		expiry := claims.ExpiresAt.Time
		blacklist.Add(tokenString, expiry)
	}
}

// 获取JWT密钥
func (s *AuthService) getJWTSecret() string {
	return s.config.JWTSecret
}

// 创建默认管理员用户
func (s *AuthService) CreateDefaultAdmin() error {
	// 检查是否已存在管理员用户
	var adminCount int64
	if err := s.db.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&adminCount).Error; err != nil {
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
	if err := s.db.Create(admin).Error; err != nil {
		return err
	}

	logrus.Infof("默认管理员用户已创建: %s", username)
	return nil
}
