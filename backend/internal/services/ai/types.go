package ai

import (
	"ai-models-backend/internal/config"
	"fmt"

	"github.com/sashabaranov/go-openai"
)

// Platform AI平台类型
type Platform string

const (
	PlatformUnknown    Platform = "unknown"
	PlatformSilicon    Platform = "silicon"
	PlatformOpenRouter Platform = "openrouter"
	PlatformDashScope  Platform = "dashscope"
	PlatformMock       Platform = "mock"
)

// AIService AI服务
type AIService struct {
	clients map[Platform]*openai.Client
	cfg     *config.Config
}

// getClient 获取指定平台的客户端
func (s *AIService) getClient(platform Platform) (*openai.Client, error) {
	// Mock 平台不需要真实客户端
	if platform == PlatformMock {
		return nil, nil
	}
	
	client, ok := s.clients[platform]
	if !ok {
		return nil, fmt.Errorf("platform %s not available", platform)
	}
	return client, nil
}

// getDefaultPlatform 获取默认平台（根据配置的API Key）
func (s *AIService) getDefaultPlatform() Platform {
	if s.cfg.SiliconAPIKey != "" {
		return PlatformSilicon
	}
	if s.cfg.OpenRouterAPIKey != "" {
		return PlatformOpenRouter
	}
	if s.cfg.DashscopeAPIKey != "" {
		return PlatformDashScope
	}
	// 如果没有配置任何API Key，则使用 Mock 平台
	return PlatformMock
}

func (s *AIService) getModelName(model string) string {
	if model == "" {
		return "gpt-3.5-turbo"
	}
	return model
}