package models

import (
	"time"
)

// 聊天请求
type ChatRequest struct {
	Message string `binding:"required"`
	Model   string
	Stream  bool `json:",omitempty"`
}

// 聊天响应
type ChatResponse struct {
	ID        string
	Message   string
	Model     string
	CreatedAt time.Time
	Usage     Usage
}

// 生成请求
type GenerateRequest struct {
	Prompt     string `binding:"required"`
	Model      string `json:",omitempty"`
	Parameters map[string]any
}

// 生成响应
type GenerateResponse struct {
	ID        string
	Content   string
	Model     string
	CreatedAt time.Time
	Usage     Usage
}

// token 使用信息
type Usage struct {
	PromptTokens     int
	CompletionTokens int
	TotalTokens      int
}

// AI 模型
type AIModel struct {
	ID           string
	Name         string
	Description  string
	Provider     string
	Type         string
	Capabilities []string
	MaxTokens    int
	IsActive     bool
}

// 聊天消息
type ChatMessage struct {
	Role      string
	Content   string
	Model     string
	CreatedAt time.Time
}

// 对话历史
type ConversationHistory struct {
	ID        uint64 `gorm:"primaryKey"`
	UserID    uint64 `gorm:"not null"`
	SessionID string `gorm:"not null"`
	Role      string `gorm:"not null"`
	Content   string `gorm:"type:text;not null"`
	Model     string
	CreatedAt time.Time
	User      User `json:"-" gorm:"foreignKey:UserID"`
}

// OpenAI 兼容模型
type OpenAIMessage struct {
	Role    string `binding:"required"`
	Content string `binding:"required"`
}

type OpenAIChatCompletionRequest struct {
	Model       string          `binding:"required"`
	Messages    []OpenAIMessage `binding:"required"`
	Stream      bool
	MaxTokens   int
	Temperature float64
	TopP        float64
	Platform    string
}

type OpenAIChoice struct {
	Index        int
	Message      OpenAIMessage
	FinishReason string
}

type OpenAIUsage struct {
	PromptTokens     int
	CompletionTokens int
	TotalTokens      int
}

type OpenAIChatCompletionResponse struct {
	ID      string
	Object  string
	Created int64
	Model   string
	Choices []OpenAIChoice
	Usage   OpenAIUsage
}

type OpenAIStreamChoice struct {
	Index int
	Delta struct {
		Role    string `json:",omitempty"`
		Content string
	}
	FinishReason *string
}

type OpenAIChatCompletionStreamResponse struct {
	ID      string
	Object  string
	Created int64
	Model   string
	Choices []OpenAIStreamChoice
}

// OpenAI错误响应
type OpenAIErrorResponse struct {
	Error OpenAIError
}

type OpenAIError struct {
	Message string
	Type    string
}

// 图片生成响应
type ImageGenerationResponse struct {
	Data []string
}
