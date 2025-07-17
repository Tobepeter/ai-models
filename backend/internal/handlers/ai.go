package handlers

import (
	"ai-models-backend/internal/models"
	"ai-models-backend/internal/services"
	"ai-models-backend/pkg/response"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// AIHandler handles AI-related HTTP requests
type AIHandler struct {
	aiService *services.AIService
}

// NewAIHandler creates a new AIHandler
func NewAIHandler(aiService *services.AIService) *AIHandler {
	return &AIHandler{
		aiService: aiService,
	}
}

// Chat handles chat requests
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

	// Handle streaming response
	if req.Stream {
		h.handleStreamingChat(c, userID.(uint), req)
		return
	}

	// Handle regular chat
	chatResponse, err := h.aiService.Chat(userID.(uint), req)
	if err != nil {
		logrus.Error("Failed to process chat:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to process chat request")
		return
	}

	response.Success(c, http.StatusOK, "Chat processed successfully", chatResponse)
}

// handleStreamingChat handles streaming chat responses
func (h *AIHandler) handleStreamingChat(c *gin.Context, userID uint, req models.ChatRequest) {
	// Set headers for streaming
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Access-Control-Allow-Origin", "*")

	// Create a channel for streaming responses
	responseChan := make(chan string, 100)
	errChan := make(chan error, 1)

	// Start streaming in a goroutine
	go func() {
		defer close(responseChan)
		defer close(errChan)
		
		err := h.aiService.StreamChat(userID, req, responseChan)
		if err != nil {
			errChan <- err
		}
	}()

	// Send streaming responses
	for {
		select {
		case chunk, ok := <-responseChan:
			if !ok {
				// Channel closed, streaming finished
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

// Generate handles text generation requests
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

// GetModels handles getting available AI models
func (h *AIHandler) GetModels(c *gin.Context) {
	models, err := h.aiService.GetAvailableModels()
	if err != nil {
		logrus.Error("Failed to get models:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to get available models")
		return
	}

	response.Success(c, http.StatusOK, "Models retrieved successfully", models)
}

// GetChatHistory handles getting chat history for a user
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

// ClearChatHistory handles clearing chat history for a user
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