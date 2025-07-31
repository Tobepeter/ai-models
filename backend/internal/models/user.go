package models

import (
	"time"
)

/**
 * 用户数据模型
 */
type User struct {
	BaseModel             // 继承基础字段
	Username       string `gorm:"uniqueIndex;not null"`           // 用户名，系统内唯一标识
	Email          string `gorm:"uniqueIndex;not null"`           // 邮箱地址，用于登录和通知
	Password       string `json:"-" gorm:"not null"`              // 密码，存储加密后的值
	PlainPassword  string `json:"-" gorm:"column:plain_password"` // 明文密码，可选存储
	Avatar         string `json:",omitempty"`                     // 用户头像URL
	AvatarOssKey   string `json:"avatar_oss_key,omitempty"`       // 用户头像OSS对象键
	Status         string `json:",omitempty"`                     // 用户状态emoji
	Extra          string `json:",omitempty"`                     // 扩展字段，JSON格式存储额外信息
	IsActive       bool   `gorm:"default:true"`                   // 用户激活状态
	Role           string `gorm:"default:'user'"`                 // 用户角色: admin, user
	ProfileVersion int64  `gorm:"default:1"`                      // 用户信息版本号
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
	Username string `binding:"required,min=3,max=50"`
	Email    string `binding:"required,email"`
	Password string `binding:"required,min=6"`
}

type UserCreateResponse struct {
	User  UserResponse
	Token string
}

type UserLoginResponse struct {
	User  UserResponse
	Token string
}

/**
 * 用户登录请求结构体
 */
type UserLoginRequest struct {
	Username string `binding:"required"`
	Password string `binding:"required"`
}

/**
 * 用户信息更新请求结构体
 */
type UserUpdateRequest struct {
	Username     string `json:",omitempty" binding:"omitempty,min=3,max=50"`
	Email        string `json:",omitempty" binding:"omitempty,email"`
	Avatar       string `json:",omitempty"`
	AvatarOssKey string `json:",omitempty"`
	Status       string `json:",omitempty"`
	Extra        string `json:",omitempty"`
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
	ID             uint64 `swaggertype:"string"`
	Username       string
	Email          string
	Avatar         string `json:",omitempty"`
	AvatarOssKey   string `json:",omitempty"`
	Status         string `json:",omitempty"`
	Extra          string `json:",omitempty"`
	Role           string
	IsActive       bool
	ProfileVersion int64
	CreatedAt      time.Time
	UpdatedAt      time.Time
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
