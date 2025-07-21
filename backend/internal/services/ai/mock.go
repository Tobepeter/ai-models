package ai

import (
	"ai-models-backend/internal/models"
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

const (
	// Mock 图片 URL
	MockImageURL = "https://picsum.photos/1024/1024?random="
)

// Mock 聊天（非流式）
func (s *AIService) mockChat(userID uint, req models.ChatRequest) (*models.ChatResponse, error) {
	// 模拟延迟
	delay := time.Duration(rand.Intn(500)+200) * time.Millisecond
	time.Sleep(delay)

	// 生成模拟回复
	content := s.generateMockResponse(req.Message)
	
	return &models.ChatResponse{
		ID:        fmt.Sprintf("chatcmpl-%s", uuid.New().String()),
		Message:   content,
		Model:     s.getModelName(req.Model),
		CreatedAt: time.Now(),
		Usage: models.Usage{
			PromptTokens:     int(rand.Intn(50) + 20),
			CompletionTokens: len(content),
			TotalTokens:      int(rand.Intn(50)+20) + len(content),
		},
	}, nil
}

// Mock 流式聊天
func (s *AIService) mockStreamChat(userID uint, req models.ChatRequest, responseChan chan<- string) error {
	// 生成完整回复
	fullResponse := s.generateMockResponse(req.Message)
	chunks := strings.Split(fullResponse, "")

	// 模拟流式发送
	for _, chunk := range chunks {
		if chunk == "" {
			continue
		}
		
		// 随机延迟
		delay := time.Duration(rand.Intn(50)+10) * time.Millisecond
		time.Sleep(delay)
		
		responseChan <- chunk
	}

	return nil
}

// Mock OpenAI 聊天完成（非流式）
func (s *AIService) mockChatCompletion(req models.OpenAIChatCompletionRequest) (*models.OpenAIChatCompletionResponse, error) {
	// 模拟延迟
	delay := time.Duration(rand.Intn(500)+200) * time.Millisecond
	time.Sleep(delay)

	// 获取用户消息
	var userMessage string
	if len(req.Messages) > 0 {
		userMessage = req.Messages[len(req.Messages)-1].Content
	}

	content := s.generateMockResponse(userMessage)
	
	return &models.OpenAIChatCompletionResponse{
		ID:      fmt.Sprintf("chatcmpl-%s", uuid.New().String()),
		Object:  "chat.completion",
		Created: time.Now().Unix(),
		Model:   req.Model,
		Choices: []models.OpenAIChoice{
			{
				Index: 0,
				Message: models.OpenAIMessage{
					Role:    "assistant",
					Content: content,
				},
				FinishReason: "stop",
			},
		},
		Usage: models.OpenAIUsage{
			PromptTokens:     int(rand.Intn(50) + 20),
			CompletionTokens: len(content),
			TotalTokens:      int(rand.Intn(50)+20) + len(content),
		},
	}, nil
}

// Mock OpenAI 流式聊天
func (s *AIService) mockChatCompletionStream(req models.OpenAIChatCompletionRequest, writer io.Writer) error {
	// 获取用户消息
	var userMessage string
	if len(req.Messages) > 0 {
		userMessage = req.Messages[len(req.Messages)-1].Content
	}

	// 生成完整回复
	fullResponse := s.generateMockResponse(userMessage)
	chunks := strings.Split(fullResponse, "")

	requestId := uuid.New().String()
	created := time.Now().Unix()

	// 发送流式数据
	for _, chunk := range chunks {
		if chunk == "" {
			continue
		}

		// 构建流式响应
		streamResponse := map[string]any{
			"id":      fmt.Sprintf("chatcmpl-%s", requestId),
			"object":  "chat.completion.chunk",
			"created": created,
			"model":   req.Model,
			"choices": []map[string]any{
				{
					"index": 0,
					"delta": map[string]string{
						"content": chunk,
					},
					"finish_reason": nil,
				},
			},
		}

		data, err := json.Marshal(streamResponse)
		if err != nil {
			continue
		}

		writer.Write([]byte("data: "))
		writer.Write(data)
		writer.Write([]byte("\n\n"))

		// 刷新缓冲区
		if flusher, ok := writer.(http.Flusher); ok {
			flusher.Flush()
		}

		// 随机延迟
		delay := time.Duration(rand.Intn(50)+10) * time.Millisecond
		time.Sleep(delay)
	}

	// 发送结束标记
	endChunk := map[string]any{
		"id":      fmt.Sprintf("chatcmpl-%s", requestId),
		"object":  "chat.completion.chunk",
		"created": created,
		"model":   req.Model,
		"choices": []map[string]any{
			{
				"index":         0,
				"delta":         map[string]any{},
				"finish_reason": "stop",
			},
		},
	}

	data, _ := json.Marshal(endChunk)
	writer.Write([]byte("data: "))
	writer.Write(data)
	writer.Write([]byte("\n\n"))
	writer.Write([]byte("data: [DONE]\n\n"))

	return nil
}

// Mock 图片生成
func (s *AIService) mockGenerateImages(prompt string, model string) ([]string, error) {
	// 模拟延迟
	delay := time.Duration(rand.Intn(2000)+1000) * time.Millisecond
	time.Sleep(delay)

	logrus.Infof("[Mock] Image generation request: %s (model: %s)", prompt, model)

	// 生成随机图片 URL
	randomID := rand.Intn(1000)
	imageURL := fmt.Sprintf("%s%d", MockImageURL, randomID)

	return []string{imageURL}, nil
}

// 生成模拟回复内容
func (s *AIService) generateMockResponse(prompt string) string {
	responses := []string{
		"你好！我是AI助手，很高兴为你服务。有什么我可以帮助你的吗？",
		"感谢你的提问！这是一个很有趣的话题。让我来为你详细解答...",
		"我理解你的问题。根据我的知识，我可以为你提供以下信息...",
		"这是一个很好的问题！让我从几个角度来分析一下...",
		"谢谢你使用我的服务。针对你的询问，我的建议是...",
	}

	// 如果包含特定关键词，返回相应回复
	prompt = strings.ToLower(prompt)
	if strings.Contains(prompt, "你好") || strings.Contains(prompt, "hello") {
		return "你好！我是AI助手，很高兴见到你！有什么我可以帮助你的吗？"
	}
	if strings.Contains(prompt, "测试") || strings.Contains(prompt, "test") {
		return "这是一个测试回复。Mock平台正在正常工作！"
	}
	if strings.Contains(prompt, "谢谢") || strings.Contains(prompt, "thank") {
		return "不客气！如果还有其他问题，随时可以问我。"
	}

	// 随机选择回复
	return responses[rand.Intn(len(responses))]
}