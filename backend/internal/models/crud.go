package models

import (
	"time"
)

// Crud 通用CRUD数据模型
type Crud struct {
	BaseModel        // 继承基础字段
	Category  string `json:"category" gorm:"type:varchar(50);index;default:'general'"` // 业务分类
	Data      string `json:"data" gorm:"type:text"`                                    // 存储JSON字符串数据
}

// CrudCreateRequest CRUD创建请求结构体
type CrudCreateRequest struct {
	Category string `json:"category"` // 业务分类，默认为general
	Data     string `json:"data" binding:"required"`
}

// CrudUpdateRequest CRUD更新请求结构体
type CrudUpdateRequest struct {
	Category string `json:"category"` // 业务分类
	Data     string `json:"data" binding:"required"`
}

// CrudResponse CRUD响应结构体
type CrudResponse struct {
	ID        uint      `json:"id"`
	Category  string    `json:"category"`
	Data      string    `json:"data"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
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
