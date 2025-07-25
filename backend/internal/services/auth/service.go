package auth

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/database"
	"ai-models-backend/internal/services"
)

/**
 * AuthService 认证服务
 * 提供JWT token生成、验证等认证相关的业务逻辑
 */
type AuthService struct {
	services.BaseService
	config *config.Config
}

// NewAuthService 创建认证服务实例
func NewAuthService(cfg *config.Config) *AuthService {
	return &AuthService{
		BaseService: services.BaseService{DB: database.DB},
		config:      cfg,
	}
}
