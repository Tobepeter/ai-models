package ai

import (
	"ai-models-backend/internal/models"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/sashabaranov/go-openai"
	"github.com/sirupsen/logrus"
)

// Chat 聊天（非流式）
func (s *AIService) Chat(userID uint64, req models.ChatRequest) (*models.ChatResponse, error) {
	platform := s.getDefaultPlatform()

	// 检查是否是 mock 平台
	if platform == PlatformMock {
		return s.mockChat(userID, req)
	}

	client, err := s.getClient(platform)
	if err != nil {
		return nil, err
	}

	chatReq := openai.ChatCompletionRequest{
		Model: s.getModelName(req.Model),
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    "user",
				Content: req.Message,
			},
		},
		Stream: false,
	}

	ctx := context.Background()
	resp, err := client.CreateChatCompletion(ctx, chatReq)
	if err != nil {
		logrus.WithError(err).Error("Failed to create chat completion")
		return nil, err
	}

	var content string
	if len(resp.Choices) > 0 {
		content = resp.Choices[0].Message.Content
	}

	return &models.ChatResponse{
		ID:        resp.ID,
		Message:   content,
		Model:     resp.Model,
		CreatedAt: time.Unix(resp.Created, 0),
		Usage: models.Usage{
			PromptTokens:     resp.Usage.PromptTokens,
			CompletionTokens: resp.Usage.CompletionTokens,
			TotalTokens:      resp.Usage.TotalTokens,
		},
	}, nil
}

// StreamChat 聊天（流式）
func (s *AIService) StreamChat(userID uint64, req models.ChatRequest, responseChan chan<- string) error {
	platform := s.getDefaultPlatform()

	// 检查是否是 mock 平台
	if platform == PlatformMock {
		return s.mockStreamChat(userID, req, responseChan)
	}

	client, err := s.getClient(platform)
	if err != nil {
		return err
	}

	chatReq := openai.ChatCompletionRequest{
		Model: s.getModelName(req.Model),
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    "user",
				Content: req.Message,
			},
		},
		Stream: true,
	}

	ctx := context.Background()
	stream, err := client.CreateChatCompletionStream(ctx, chatReq)
	if err != nil {
		logrus.WithError(err).Error("Failed to create chat completion stream")
		return err
	}
	defer stream.Close()

	for {
		response, err := stream.Recv()
		if err != nil {
			if err == io.EOF {
				break
			}
			return err
		}

		if len(response.Choices) > 0 && response.Choices[0].Delta.Content != "" {
			responseChan <- response.Choices[0].Delta.Content
		}
	}

	return nil
}

// ChatCompletion OpenAI兼容的聊天接口（非流式）
func (s *AIService) ChatCompletion(platform Platform, req models.OpenAIChatCompletionRequest) (*models.OpenAIChatCompletionResponse, error) {
	if platform == "" {
		platform = s.getDefaultPlatform()
	}

	// 检查是否是 mock 平台
	if platform == PlatformMock {
		return s.mockChatCompletion(req)
	}

	client, err := s.getClient(platform)
	if err != nil {
		return nil, err
	}

	messages := make([]openai.ChatCompletionMessage, len(req.Messages))
	for i, msg := range req.Messages {
		messages[i] = openai.ChatCompletionMessage{
			Role:    msg.Role,
			Content: msg.Content,
		}
	}

	chatReq := openai.ChatCompletionRequest{
		Model:    req.Model,
		Messages: messages,
		Stream:   false,
	}

	ctx := context.Background()
	resp, err := client.CreateChatCompletion(ctx, chatReq)
	if err != nil {
		return nil, err
	}

	var content string
	if len(resp.Choices) > 0 {
		content = resp.Choices[0].Message.Content
	}

	return &models.OpenAIChatCompletionResponse{
		ID:      resp.ID,
		Object:  "chat.completion",
		Created: resp.Created,
		Model:   resp.Model,
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
			PromptTokens:     resp.Usage.PromptTokens,
			CompletionTokens: resp.Usage.CompletionTokens,
			TotalTokens:      resp.Usage.TotalTokens,
		},
	}, nil
}

// ChatCompletionStream OpenAI兼容的聊天接口（流式）
func (s *AIService) ChatCompletionStream(platform Platform, req models.OpenAIChatCompletionRequest, writer io.Writer) error {
	if platform == "" {
		platform = s.getDefaultPlatform()
	}

	// 检查是否是 mock 平台
	if platform == PlatformMock {
		return s.mockChatCompletionStream(req, writer)
	}

	client, err := s.getClient(platform)
	if err != nil {
		return err
	}

	messages := make([]openai.ChatCompletionMessage, len(req.Messages))
	for i, msg := range req.Messages {
		messages[i] = openai.ChatCompletionMessage{
			Role:    msg.Role,
			Content: msg.Content,
		}
	}

	chatReq := openai.ChatCompletionRequest{
		Model:    req.Model,
		Messages: messages,
		Stream:   true,
	}

	ctx := context.Background()
	stream, err := client.CreateChatCompletionStream(ctx, chatReq)
	if err != nil {
		return err
	}
	defer stream.Close()

	for {
		response, err := stream.Recv()
		if err != nil {
			if err == io.EOF {
				writer.Write([]byte("data: [DONE]\n\n"))
				break
			}
			return err
		}

		// 构建流式响应
		streamResponse := map[string]any{
			"id":      response.ID,
			"object":  "chat.completion.chunk",
			"created": response.Created,
			"model":   response.Model,
			"choices": response.Choices,
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
	}

	return nil
}
