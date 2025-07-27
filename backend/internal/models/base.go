package models

import (
	"time"

	"gorm.io/gorm"
)

// BaseModel 基础模型
type BaseModel struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// BaseSoftModel 基础软删除模型
type BaseSoftModel struct {
	BaseModel
	// 目前不建议用，很麻烦，特别是uniqueKey比较多时候，软删除还不让加
	// 除非你每次upadte或者新增时候，如果有占位的软删除字段都要删掉
	// 一般前端警告一下数据不可恢复就行了
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// Pagination 分页模型
type Pagination struct {
	Current  int   `json:"current"`
	PageSize int   `json:"pageSize"`
	Total    int64 `json:"total"`
}

// PaginationResponse 分页响应模型
type PaginationResponse[T any] struct {
	Data       []T        `json:"data"`
	Pagination Pagination `json:"pagination"`
}
