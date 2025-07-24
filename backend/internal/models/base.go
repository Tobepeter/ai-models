package models

import (
	"time"

	"gorm.io/gorm"
)

/**
 * 数据库模型基础结构体
 * 包含所有模型的通用字段
 */
type BaseModel struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type Pagination struct {
	Current  int   `json:"current"`
	PageSize int   `json:"pageSize"`
	Total    int64 `json:"total"`
}

type PaginationResponse[T any] struct {
	Data       []T        `json:"data"`
	Pagination Pagination `json:"pagination"`
}
