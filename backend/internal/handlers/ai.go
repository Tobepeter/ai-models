package handlers

import (
	"ai-models-backend/internal/models"
	"ai-models-backend/internal/services/ai"
	"ai-models-backend/pkg/response"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type AIHandler struct {
	BaseHandler
	aiService *ai.AIService
}

func NewAIHandler(aiService *ai.AIService) *AIHandler {
	return &AIHandler{
		BaseHandler: BaseHandler{},
		aiService:   aiService,
	}
}

// @Summary AI聊天
// @Description 与AI模型进行对话聊天，支持流式和非流式响应，可以指定使用的AI模型
// @Tags AI
// @Param request body models.ChatRequest true "聊天请求"
// @Success 200 {object} response.Response{data=models.ChatResponse}
// @Router /ai/chat [post]
func (h *AIHandler) Chat(c *gin.Context) {
	userID, ok := h.GetUserID(c)
	if !ok {
		return
	}

	var req models.ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Error("Invalid request body:", err)
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Stream {
		h.handleStreamingChat(c, userID, req)
		return
	}
	chatResponse, err := h.aiService.Chat(userID, req)
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

// @Summary 文本生成
// @Description 基于提示词生成文本内容，支持自定义参数和不同的AI模型
// @Tags AI
// @Param request body models.GenerateRequest true "生成请求"
// @Success 200 {object} response.Response{data=models.GenerateResponse}
// @Router /ai/generate [post]
func (h *AIHandler) Generate(c *gin.Context) {
	userID, ok := h.GetUserID(c)
	if !ok {
		return
	}

	var req models.GenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Error("Invalid request body:", err)
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	generateResponse, err := h.aiService.Generate(userID, req)
	if err != nil {
		logrus.Error("Failed to generate content:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to generate content")
		return
	}

	response.Success(c, generateResponse)
}

// @Summary 获取模型列表
// @Description 获取可用的AI模型列表，支持不同的AI平台和模型类型
// @Tags AI
// @Success 200 {object} response.Response{data=[]models.AIModel}
// @Router /ai/models [get]
func (h *AIHandler) GetModels(c *gin.Context) {
	models, err := h.aiService.GetAvailableModels()
	if err != nil {
		logrus.Error("Failed to get models:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to get available models")
		return
	}

	response.Success(c, models)
}

// @Summary 获取聊天历史
// @Description 获取用户的历史聊天记录，支持分页和过滤
// @Tags AI
// @Param session_id query string true "会话ID"
// @Success 200 {object} response.Response{data=[]models.ChatMessage}
// @Router /ai/chat/history [get]
func (h *AIHandler) GetChatHistory(c *gin.Context) {
	userID, ok := h.GetUserID(c)
	if !ok {
		return
	}

	sessionID := c.Query("session_id")
	if sessionID == "" {
		response.Error(c, http.StatusBadRequest, "Session ID is required")
		return
	}

	history, err := h.aiService.GetChatHistory(userID, sessionID)
	if err != nil {
		logrus.Error("Failed to get chat history:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to get chat history")
		return
	}

	response.Success(c, history)
}

// @Summary 清除聊天历史
// @Description 清除用户的历史聊天记录，支持按会话ID清除
// @Tags AI
// @Param session_id query string true "会话ID"
// @Success 200 {object} response.Response
// @Router /ai/chat/history [delete]
func (h *AIHandler) ClearChatHistory(c *gin.Context) {
	userID, ok := h.GetUserID(c)
	if !ok {
		return
	}

	sessionID := c.Query("session_id")
	if sessionID == "" {
		response.Error(c, http.StatusBadRequest, "Session ID is required")
		return
	}

	err := h.aiService.ClearChatHistory(userID, sessionID)
	if err != nil {
		logrus.Error("Failed to clear chat history:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to clear chat history")
		return
	}

	response.Success(c, nil)
}

// @Summary OpenAI兼容聊天接口
// @Description OpenAI兼容聊天接口，支持流式和非流式响应，可以指定使用的AI模型
// @Tags AI
// @Param platform query string false "平台"
// @Param request body models.OpenAIChatCompletionRequest true "OpenAI聊天请求"
// @Success 200 {object} models.OpenAIChatCompletionResponse
// @Router /ai/v1/chat/completions [post]
func (h *AIHandler) OpenAIChatCompletion(c *gin.Context) {
	var req models.OpenAIChatCompletionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Error("Invalid OpenAI request body:", err)
		c.JSON(http.StatusBadRequest, models.OpenAIErrorResponse{
			Error: models.OpenAIError{
				Message: "Invalid request body",
				Type:    "invalid_request_error",
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
		c.JSON(http.StatusInternalServerError, models.OpenAIErrorResponse{
			Error: models.OpenAIError{
				Message: "Failed to process request",
				Type:    "internal_error",
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

// @Summary 图片生成
// @Description 基于提示词生成图片，支持自定义参数和不同的AI模型
// @Tags AI
// @Param platform query string false "平台"
// @Param request body object{prompt=string,model=string} true "图片生成请求"
// @Success 200 {object} response.Response{data=[]string}
// @Router /ai/v1/images/generations [post]
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

	response.Success(c, models.ImageGenerationResponse{
		Data: urls,
	})
}
