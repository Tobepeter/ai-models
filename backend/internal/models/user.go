package models

import (
	"time"
)

/**
 * 用户数据模型
 */
type User struct {
	BaseModel               // 继承基础字段
	Username        string  `json:"username" gorm:"uniqueIndex;not null"` // 用户名，系统内唯一标识
	Email           string  `json:"email" gorm:"uniqueIndex;not null"`    // 邮箱地址，用于登录和通知
	Password        string  `json:"-" gorm:"not null"`                    // 密码，存储加密后的值
	PlainPassword   string  `json:"-" gorm:"column:plain_password"`       // 明文密码，可选存储
	Avatar          string  `json:"avatar,omitempty"`                     // 用户头像URL
	AvatarOssKey    string  `json:"avatar_oss_key,omitempty"`             // 用户头像OSS对象键
	Status          string  `json:"status,omitempty"`                     // 用户状态emoji
	Extra           string  `json:"extra,omitempty"`                      // 扩展字段，JSON格式存储额外信息
	IsActive        bool    `json:"is_active" gorm:"default:true"`        // 用户激活状态
	Role            string  `json:"role" gorm:"default:'user'"`           // 用户角色: admin, user
	ProfileVersion  int64   `json:"profile_version" gorm:"default:1"`     // 用户信息版本号
}

// 用户角色常量
const (
	RoleAdmin = "admin"
	RoleUser  = "user"
)

func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

/**
 * 用户创建请求结构体
 */
type UserCreateRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type UserCreateResponse struct {
	User  UserResponse `json:"user"`
	Token string       `json:"token"`
}

type UserLoginResponse struct {
	User  UserResponse `json:"user"`
	Token string       `json:"token"`
}

/**
 * 用户登录请求结构体
 */
type UserLoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

/**
 * 用户信息更新请求结构体
 */
type UserUpdateRequest struct {
	Username     string `json:"username,omitempty" binding:"omitempty,min=3,max=50"`
	Email        string `json:"email,omitempty" binding:"omitempty,email"`
	Avatar       string `json:"avatar,omitempty"`
	AvatarOssKey string `json:"avatar_oss_key,omitempty"`
	Status       string `json:"status,omitempty"`
	Extra        string `json:"extra,omitempty"`
}

/**
 * 修改密码请求结构体
 */
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

/**
 * 用户响应结构体
 */
type UserResponse struct {
	ID             uint      `json:"id"`
	Username       string    `json:"username"`
	Email          string    `json:"email"`
	Avatar         string    `json:"avatar,omitempty"`
	AvatarOssKey   string    `json:"avatar_oss_key,omitempty"`
	Status         string    `json:"status,omitempty"`
	Extra          string    `json:"extra,omitempty"`
	Role           string    `json:"role"`
	IsActive       bool      `json:"is_active"`
	ProfileVersion int64     `json:"profile_version"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

/* 将用户模型转换为响应格式 */
func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:             u.ID,
		Username:       u.Username,
		Email:          u.Email,
		Avatar:         u.Avatar,
		AvatarOssKey:   u.AvatarOssKey,
		Status:         u.Status,
		Extra:          u.Extra,
		Role:           u.Role,
		IsActive:       u.IsActive,
		ProfileVersion: u.ProfileVersion,
		CreatedAt:      u.CreatedAt,
		UpdatedAt:      u.UpdatedAt,
	}
}

/**
 * 用户列表分页响应结构体
 */
