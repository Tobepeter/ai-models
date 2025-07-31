package models

import (
	"time"
)

// Todo TODO数据模型
type Todo struct {
	BaseModel              // 继承基础字段
	UserID      uint64     `gorm:"not null;index"` // 用户ID，建立索引
	Title       string     `gorm:"type:varchar(255);not null"`
	Description string     `gorm:"type:text"`
	Completed   bool       `gorm:"default:false"`
	Priority    int        `gorm:"default:0"`       // 简化为 int，前端自定义含义
	Position    float64    `gorm:"default:0;index"` // 排序位置，支持拖拽
	DueDate     *time.Time `gorm:"type:timestamp"`
}

// TodoCreateRequest TODO创建请求结构体
type TodoCreateRequest struct {
	Title       string     `binding:"required"` // 必填
	Description string     // 可选
	Priority    int        // 可选
	Position    *float64   // 可选，不传则自动分配
	DueDate     *time.Time // 可选
}

// TodoUpdateRequest TODO更新请求结构体
type TodoUpdateRequest struct {
	Title       string     // 可选，不传不更新
	Description string     // 可选，不传不更新
	Completed   *bool      // 可选，使用指针区分false和未设置
	Priority    int        // 可选，不传不更新
	Position    *float64   // 可选，支持更新排序位置
	DueDate     *time.Time // 可选，不传不更新
}

// TodoResponse TODO响应结构体
type TodoResponse struct {
	ID          uint64 `swaggertype:"string"`
	Title       string
	Description string
	Completed   bool
	Priority    int
	Position    float64
	DueDate     *time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// TodoPositionUpdateRequest 批量更新位置请求
type TodoPositionUpdateRequest struct {
	Items []TodoPositionItem `binding:"required,dive"` // 必填，dive验证数组元素
}

type TodoPositionItem struct {
	ID       uint64  `binding:"required" swaggertype:"string"` // 必填
	Position float64 `binding:"required"`                      // 必填
}

// ToResponse 将TODO模型转换为响应格式
func (t *Todo) ToResponse() TodoResponse {
	return TodoResponse{
		ID:          t.ID,
		Title:       t.Title,
		Description: t.Description,
		Completed:   t.Completed,
		Priority:    t.Priority,
		Position:    t.Position,
		DueDate:     t.DueDate,
		CreatedAt:   t.CreatedAt,
		UpdatedAt:   t.UpdatedAt,
	}
}
