package models

import (
	"time"
)

// Crud 通用CRUD数据模型
type Crud struct {
	BaseModel        // 继承基础字段
	Category  string `gorm:"type:varchar(50);index;default:'general'"` // 业务分类
	Data      string `gorm:"type:text"`                                // 存储JSON字符串数据
}

// CrudCreateRequest CRUD创建请求结构体
type CrudCreateRequest struct {
	Category string // 业务分类，默认为general
	Data     string `binding:"required"`
}

// CrudUpdateRequest CRUD更新请求结构体
type CrudUpdateRequest struct {
	Category string // 业务分类
	Data     string `binding:"required"`
}

// CrudResponse CRUD响应结构体
type CrudResponse struct {
	ID        uint64 `swaggertype:"string"`
	Category  string
	Data      string
	CreatedAt time.Time
	UpdatedAt time.Time
}

// ToResponse 将CRUD模型转换为响应格式
func (c *Crud) ToResponse() CrudResponse {
	return CrudResponse{
		ID:        c.ID,
		Category:  c.Category,
		Data:      c.Data,
		CreatedAt: c.CreatedAt,
		UpdatedAt: c.UpdatedAt,
	}
}
