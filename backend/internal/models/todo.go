package models

import (
	"time"
)

// Todo TODO数据模型
type Todo struct {
	BaseModel              // 继承基础字段
	UserID      uint64     `json:"user_id" gorm:"not null;index"` // 用户ID，建立索引
	Title       string     `json:"title" gorm:"type:varchar(255);not null"`
	Description string     `json:"description" gorm:"type:text"`
	Completed   bool       `json:"completed" gorm:"default:false"`
	Priority    int        `json:"priority" gorm:"default:0"`       // 简化为 int，前端自定义含义
	Position    float64    `json:"position" gorm:"default:0;index"` // 排序位置，支持拖拽
	DueDate     *time.Time `json:"due_date" gorm:"type:timestamp"`
}

// TodoCreateRequest TODO创建请求结构体
type TodoCreateRequest struct {
	Title       string     `json:"title" binding:"required"` // 必填
	Description string     `json:"description"` // 可选
	Priority    int        `json:"priority"` // 可选
	Position    *float64   `json:"position"` // 可选，不传则自动分配
	DueDate     *time.Time `json:"due_date"` // 可选
}

// TodoUpdateRequest TODO更新请求结构体
type TodoUpdateRequest struct {
	Title       string     `json:"title"` // 可选，不传不更新
	Description string     `json:"description"` // 可选，不传不更新
	Completed   *bool      `json:"completed"` // 可选，使用指针区分false和未设置
	Priority    int        `json:"priority"` // 可选，不传不更新
	Position    *float64   `json:"position"` // 可选，支持更新排序位置
	DueDate     *time.Time `json:"due_date"` // 可选，不传不更新
}

// TodoResponse TODO响应结构体
type TodoResponse struct {
	ID          uint64 `json:"id" swaggertype:"string"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Completed   bool `json:"completed"`
	Priority    int `json:"priority"`
	Position    float64 `json:"position"`
	DueDate     *time.Time `json:"due_date"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TodoPositionUpdateRequest 批量更新位置请求
type TodoPositionUpdateRequest struct {
	Items []TodoPositionItem `json:"items" binding:"required,dive"` // 必填，dive验证数组元素
}

type TodoPositionItem struct {
	ID       uint64  `json:"id" binding:"required" swaggertype:"string"` // 必填
	Position float64 `json:"position" binding:"required"`                      // 必填
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
