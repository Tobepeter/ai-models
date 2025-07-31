package ai

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/models"

	"github.com/sashabaranov/go-openai"
)

func NewAIService(cfg *config.Config) *AIService {
	service := &AIService{
		clients: make(map[Platform]*openai.Client),
		cfg:     cfg,
	}

	// 初始化客户端
	if cfg.SiliconAPIKey != "" {
		clientConfig := openai.DefaultConfig(cfg.SiliconAPIKey)
		clientConfig.BaseURL = "https://api.siliconflow.cn/v1"
		service.clients[PlatformSilicon] = openai.NewClientWithConfig(clientConfig)
	}

	if cfg.OpenRouterAPIKey != "" {
		clientConfig := openai.DefaultConfig(cfg.OpenRouterAPIKey)
		clientConfig.BaseURL = "https://openrouter.ai/api/v1"
		service.clients[PlatformOpenRouter] = openai.NewClientWithConfig(clientConfig)
	}

	if cfg.DashscopeAPIKey != "" {
		clientConfig := openai.DefaultConfig(cfg.DashscopeAPIKey)
		clientConfig.BaseURL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
		service.clients[PlatformDashScope] = openai.NewClientWithConfig(clientConfig)
	}

	// Mock 平台不需要真实客户端，但为了统一处理，创建一个占位客户端
	service.clients[PlatformMock] = nil

	return service
}

// Generate 文本生成（兼容旧接口）
func (s *AIService) Generate(userID uint64, req models.GenerateRequest) (*models.GenerateResponse, error) {
	// 转换为聊天请求
	chatReq := models.ChatRequest{
		Message: req.Prompt,
		Model:   req.Model,
		Stream:  false,
	}

	chatResp, err := s.Chat(userID, chatReq)
	if err != nil {
		return nil, err
	}

	return &models.GenerateResponse{
		ID:        chatResp.ID,
		Content:   chatResp.Message,
		Model:     chatResp.Model,
		CreatedAt: chatResp.CreatedAt,
		Usage:     chatResp.Usage,
	}, nil
}

// GetAvailableModels 获取可用模型
func (s *AIService) GetAvailableModels() ([]models.AIModel, error) {
	models := []models.AIModel{
		{
			ID:           "gpt-3.5-turbo",
			Name:         "GPT-3.5 Turbo",
			Description:  "Fast and efficient language model",
			Provider:     "OpenAI",
			Type:         "chat",
			Capabilities: []string{"text-generation", "chat"},
			MaxTokens:    4096,
			IsActive:     true,
		},
		{
			ID:           "gpt-4",
			Name:         "GPT-4",
			Description:  "Most capable language model",
			Provider:     "OpenAI",
			Type:         "chat",
			Capabilities: []string{"text-generation", "chat"},
			MaxTokens:    8192,
			IsActive:     true,
		},
		{
			ID:           "deepseek-chat",
			Name:         "DeepSeek Chat",
			Description:  "Fast Chinese language model",
			Provider:     "DeepSeek",
			Type:         "chat",
			Capabilities: []string{"text-generation", "chat"},
			MaxTokens:    4096,
			IsActive:     true,
		},
	}

	return models, nil
}

// GetChatHistory 获取聊天历史（Mock实现）
func (s *AIService) GetChatHistory(userID uint64, sessionID string) ([]models.ConversationHistory, error) {
	return []models.ConversationHistory{}, nil
}

// ClearChatHistory 清除聊天历史（Mock实现）
func (s *AIService) ClearChatHistory(userID uint64, sessionID string) error {
	return nil
}
