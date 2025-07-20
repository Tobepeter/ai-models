package models

import (
	"time"
)

// 聊天请求
type ChatRequest struct {
	Message string `json:"message" binding:"required"`
	Model   string `json:"model,omitempty"`
	Stream  bool   `json:"stream,omitempty"`
}

// 聊天响应
type ChatResponse struct {
	ID        string    `json:"id"`
	Message   string    `json:"message"`
	Model     string    `json:"model"`
	CreatedAt time.Time `json:"created_at"`
	Usage     Usage     `json:"usage"`
}

// 生成请求
type GenerateRequest struct {
	Prompt     string            `json:"prompt" binding:"required"`
	Model      string            `json:"model,omitempty"`
	Parameters map[string]interface{} `json:"parameters,omitempty"`
}

// 生成响应
type GenerateResponse struct {
	ID        string    `json:"id"`
	Content   string    `json:"content"`
	Model     string    `json:"model"`
	CreatedAt time.Time `json:"created_at"`
	Usage     Usage     `json:"usage"`
}

// token 使用信息
type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

// AI 模型
type AIModel struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Provider    string   `json:"provider"`
	Type        string   `json:"type"`
	Capabilities []string `json:"capabilities"`
	MaxTokens   int      `json:"max_tokens"`
	IsActive    bool     `json:"is_active"`
}

// 对话历史
type ConversationHistory struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null"`
	SessionID string    `json:"session_id" gorm:"not null"`
	Role      string    `json:"role" gorm:"not null"`
	Content   string    `json:"content" gorm:"type:text;not null"`
	Model     string    `json:"model"`
	CreatedAt time.Time `json:"created_at"`
	
	User User `json:"-" gorm:"foreignKey:UserID"`
}

// OpenAI 兼容模型
type OpenAIMessage struct {
	Role    string `json:"role" binding:"required"`
	Content string `json:"content" binding:"required"`
}

type OpenAIChatCompletionRequest struct {
	Model       string          `json:"model" binding:"required"`
	Messages    []OpenAIMessage `json:"messages" binding:"required"`
	Stream      bool            `json:"stream,omitempty"`
	MaxTokens   int             `json:"max_tokens,omitempty"`
	Temperature float64         `json:"temperature,omitempty"`
	TopP        float64         `json:"top_p,omitempty"`
	Platform    string          `json:"platform,omitempty"`
}

type OpenAIChoice struct {
	Index        int           `json:"index"`
	Message      OpenAIMessage `json:"message"`
	FinishReason string        `json:"finish_reason"`
}

type OpenAIUsage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

type OpenAIChatCompletionResponse struct {
	ID      string        `json:"id"`
	Object  string        `json:"object"`
	Created int64         `json:"created"`
	Model   string        `json:"model"`
	Choices []OpenAIChoice `json:"choices"`
	Usage   OpenAIUsage   `json:"usage"`
}

type OpenAIStreamChoice struct {
	Index int `json:"index"`
	Delta struct {
		Role    string `json:"role,omitempty"`
		Content string `json:"content,omitempty"`
	} `json:"delta"`
	FinishReason *string `json:"finish_reason"`
}

type OpenAIChatCompletionStreamResponse struct {
	ID      string               `json:"id"`
	Object  string               `json:"object"`
	Created int64                `json:"created"`
	Model   string               `json:"model"`
	Choices []OpenAIStreamChoice `json:"choices"`
}