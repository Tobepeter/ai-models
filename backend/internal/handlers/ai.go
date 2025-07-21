package handlers

import (
	"ai-models-backend/internal/models"
	"ai-models-backend/internal/services"
	"ai-models-backend/pkg/response"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

// AI请求处理器
type AIHandler struct {
	aiService *services.AIService
}
func NewAIHandler(aiService *services.AIService) *AIHandler {
	return &AIHandler{
		aiService: aiService,
	}
}

// 聊天接口
func (h *AIHandler) Chat(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not found in context")
		return
	}

	var req models.ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Error("Invalid request body:", err)
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Stream {
		h.handleStreamingChat(c, userID.(uint), req)
		return
	}
	chatResponse, err := h.aiService.Chat(userID.(uint), req)
	if err != nil {
		logrus.Error("Failed to process chat:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to process chat request")
		return
	}

	response.Success(c, http.StatusOK, "Chat processed successfully", chatResponse)
}

func (h *AIHandler) handleStreamingChat(c *gin.Context, userID uint, req models.ChatRequest) {
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Access-Control-Allow-Origin", "*")

	responseChan := make(chan string, 100)
	errChan := make(chan error, 1)
	go func() {
		defer close(responseChan)
		defer close(errChan)
		
		err := h.aiService.StreamChat(userID, req, responseChan)
		if err != nil {
			errChan <- err
		}
	}()

	for {
		select {
		case chunk, ok := <-responseChan:
			if !ok {
				c.SSEvent("done", "")
				return
			}
			c.SSEvent("data", chunk)
			c.Writer.Flush()
		case err := <-errChan:
			if err != nil {
				logrus.Error("Streaming error:", err)
				c.SSEvent("error", err.Error())
				return
			}
		}
	}
}

// 文本生成接口
func (h *AIHandler) Generate(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not found in context")
		return
	}

	var req models.GenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Error("Invalid request body:", err)
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	generateResponse, err := h.aiService.Generate(userID.(uint), req)
	if err != nil {
		logrus.Error("Failed to generate content:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to generate content")
		return
	}

	response.Success(c, http.StatusOK, "Content generated successfully", generateResponse)
}

// 获取模型列表
func (h *AIHandler) GetModels(c *gin.Context) {
	models, err := h.aiService.GetAvailableModels()
	if err != nil {
		logrus.Error("Failed to get models:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to get available models")
		return
	}

	response.Success(c, http.StatusOK, "Models retrieved successfully", models)
}

// 获取聊天历史
func (h *AIHandler) GetChatHistory(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not found in context")
		return
	}

	sessionID := c.Query("session_id")
	if sessionID == "" {
		response.Error(c, http.StatusBadRequest, "Session ID is required")
		return
	}

	history, err := h.aiService.GetChatHistory(userID.(uint), sessionID)
	if err != nil {
		logrus.Error("Failed to get chat history:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to get chat history")
		return
	}

	response.Success(c, http.StatusOK, "Chat history retrieved successfully", history)
}

// 清除聊天历史
func (h *AIHandler) ClearChatHistory(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not found in context")
		return
	}

	sessionID := c.Query("session_id")
	if sessionID == "" {
		response.Error(c, http.StatusBadRequest, "Session ID is required")
		return
	}

	err := h.aiService.ClearChatHistory(userID.(uint), sessionID)
	if err != nil {
		logrus.Error("Failed to clear chat history:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to clear chat history")
		return
	}

	response.Success(c, http.StatusOK, "Chat history cleared successfully", nil)
}

// OpenAI 兼容接口
func (h *AIHandler) OpenAIChatCompletion(c *gin.Context) {
	var req models.OpenAIChatCompletionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Error("Invalid OpenAI request body:", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": gin.H{
				"message": "Invalid request body",
				"type":    "invalid_request_error",
			},
		})
		return
	}

	requestID := fmt.Sprintf("chatcmpl-%s", uuid.New().String())
	created := time.Now().Unix()
	if req.Stream {
		h.handleOpenAIStreamingChat(c, requestID, created, req)
		return
	}

	var lastMessage string
	if len(req.Messages) > 0 {
		lastMessage = req.Messages[len(req.Messages)-1].Content
	}

	response := models.OpenAIChatCompletionResponse{
		ID:      requestID,
		Object:  "chat.completion",
		Created: created,
		Model:   req.Model,
		Choices: []models.OpenAIChoice{
			{
				Index: 0,
				Message: models.OpenAIMessage{
					Role:    "assistant",
					Content: fmt.Sprintf("This is a placeholder response for: %s (Platform: %s)", lastMessage, req.Platform),
				},
				FinishReason: "stop",
			},
		},
		Usage: models.OpenAIUsage{
			PromptTokens:     len(lastMessage) / 4, // rough token estimation
			CompletionTokens: 20,
			TotalTokens:      len(lastMessage)/4 + 20,
		},
	}

	c.JSON(http.StatusOK, response)
}

func (h *AIHandler) handleOpenAIStreamingChat(c *gin.Context, requestID string, created int64, req models.OpenAIChatCompletionRequest) {
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Access-Control-Allow-Origin", "*")

	initialChunk := models.OpenAIChatCompletionStreamResponse{
		ID:      requestID,
		Object:  "chat.completion.chunk",
		Created: created,
		Model:   req.Model,
		Choices: []models.OpenAIStreamChoice{
			{
				Index: 0,
				Delta: struct {
					Role    string `json:"role,omitempty"`
					Content string `json:"content,omitempty"`
				}{
					Role: "assistant",
				},
				FinishReason: nil,
			},
		},
	}

	c.SSEvent("", fmt.Sprintf("data: %s", toJSON(initialChunk)))
	c.Writer.Flush()

	// var lastMessage string
	// if len(req.Messages) > 0 {
	// 	lastMessage = req.Messages[len(req.Messages)-1].Content
	// }

	// placeholderResponse := fmt.Sprintf("This is a placeholder streaming response for: %s (Platform: %s)", lastMessage, req.Platform)
	
	words := []string{"This", " is", " a", " placeholder", " streaming", " response"}
	for _, word := range words {
		chunk := models.OpenAIChatCompletionStreamResponse{
			ID:      requestID,
			Object:  "chat.completion.chunk",
			Created: created,
			Model:   req.Model,
			Choices: []models.OpenAIStreamChoice{
				{
					Index: 0,
					Delta: struct {
						Role    string `json:"role,omitempty"`
						Content string `json:"content,omitempty"`
					}{
						Content: word,
					},
					FinishReason: nil,
				},
			},
		}

		c.SSEvent("", fmt.Sprintf("data: %s", toJSON(chunk)))
		c.Writer.Flush()
		time.Sleep(100 * time.Millisecond) // Small delay to simulate streaming
	}

	finalChunk := models.OpenAIChatCompletionStreamResponse{
		ID:      requestID,
		Object:  "chat.completion.chunk",
		Created: created,
		Model:   req.Model,
		Choices: []models.OpenAIStreamChoice{
			{
				Index:        0,
				Delta:        struct {
					Role    string `json:"role,omitempty"`
					Content string `json:"content,omitempty"`
				}{},
				FinishReason: stringPtr("stop"),
			},
		},
	}

	c.SSEvent("", fmt.Sprintf("data: %s", toJSON(finalChunk)))
	c.SSEvent("", "data: [DONE]")
	c.Writer.Flush()
}

func toJSON(v interface{}) string {
	data, err := json.Marshal(v)
	if err != nil {
		logrus.Error("Failed to marshal JSON:", err)
		return ""
	}
	return string(data)
}

func stringPtr(s string) *string {
	return &s
}