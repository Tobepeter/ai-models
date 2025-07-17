package models

import (
	"time"
)

// ChatRequest represents a chat request
type ChatRequest struct {
	Message string `json:"message" binding:"required"`
	Model   string `json:"model,omitempty"`
	Stream  bool   `json:"stream,omitempty"`
}

// ChatResponse represents a chat response
type ChatResponse struct {
	ID        string    `json:"id"`
	Message   string    `json:"message"`
	Model     string    `json:"model"`
	CreatedAt time.Time `json:"created_at"`
	Usage     Usage     `json:"usage"`
}

// GenerateRequest represents a generation request
type GenerateRequest struct {
	Prompt     string            `json:"prompt" binding:"required"`
	Model      string            `json:"model,omitempty"`
	Parameters map[string]interface{} `json:"parameters,omitempty"`
}

// GenerateResponse represents a generation response
type GenerateResponse struct {
	ID        string    `json:"id"`
	Content   string    `json:"content"`
	Model     string    `json:"model"`
	CreatedAt time.Time `json:"created_at"`
	Usage     Usage     `json:"usage"`
}

// Usage represents token usage information
type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

// AIModel represents an available AI model
type AIModel struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Provider    string   `json:"provider"`
	Type        string   `json:"type"` // "chat", "completion", "embedding"
	Capabilities []string `json:"capabilities"`
	MaxTokens   int      `json:"max_tokens"`
	IsActive    bool     `json:"is_active"`
}

// ConversationHistory represents chat conversation history
type ConversationHistory struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null"`
	SessionID string    `json:"session_id" gorm:"not null"`
	Role      string    `json:"role" gorm:"not null"` // "user", "assistant"
	Content   string    `json:"content" gorm:"type:text;not null"`
	Model     string    `json:"model"`
	CreatedAt time.Time `json:"created_at"`
	
	// Relationship
	User User `json:"-" gorm:"foreignKey:UserID"`
}