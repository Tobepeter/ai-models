package handlers

import (
	"ai-models-backend/internal/models"
	"ai-models-backend/internal/services/ai"
	"ai-models-backend/pkg/response"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// AI请求处理器
type AIHandler struct {
	aiService *ai.AIService
}

func NewAIHandler(aiService *ai.AIService) *AIHandler {
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

	response.Success(c, chatResponse)
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

	response.Success(c, generateResponse)
}

// 获取模型列表
func (h *AIHandler) GetModels(c *gin.Context) {
	models, err := h.aiService.GetAvailableModels()
	if err != nil {
		logrus.Error("Failed to get models:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to get available models")
		return
	}

	response.Success(c, models)
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

	response.Success(c, history)
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

	response.Success(c, nil)
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

	// 获取平台参数
	platform := ai.Platform(c.Query("platform"))

	if req.Stream {
		h.handleOpenAIStreamingChat(c, platform, req)
		return
	}

	resp, err := h.aiService.ChatCompletion(platform, req)
	if err != nil {
		logrus.WithError(err).Error("Failed to call AI service")
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": gin.H{
				"message": "Failed to process request",
				"type":    "internal_error",
			},
		})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *AIHandler) handleOpenAIStreamingChat(c *gin.Context, platform ai.Platform, req models.OpenAIChatCompletionRequest) {
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Access-Control-Allow-Origin", "*")

	err := h.aiService.ChatCompletionStream(platform, req, c.Writer)
	if err != nil {
		logrus.WithError(err).Error("Failed to stream chat")
		c.SSEvent("error", err.Error())
		return
	}
}

// 图片生成接口
func (h *AIHandler) GenerateImages(c *gin.Context) {
	var req struct {
		Prompt string `json:"prompt" binding:"required"`
		Model  string `json:"model"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Error("Invalid image generation request:", err)
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	// 获取平台参数
	platform := ai.Platform(c.Query("platform"))

	urls, err := h.aiService.GenerateImages(platform, req.Prompt, req.Model)
	if err != nil {
		logrus.WithError(err).Error("Failed to generate images")
		response.Error(c, http.StatusInternalServerError, "Failed to generate images")
		return
	}

	response.Success(c, gin.H{
		"data": urls,
	})
}