package ai

import (
	"context"

	"github.com/sashabaranov/go-openai"
	"github.com/sirupsen/logrus"
)

// GenerateImages 图片生成
func (s *AIService) GenerateImages(platform Platform, prompt string, model string) ([]string, error) {
	if platform == "" {
		platform = s.getDefaultPlatform()
	}

	// 检查是否是 mock 平台
	if platform == PlatformMock {
		return s.mockGenerateImages(prompt, model)
	}

	client, err := s.getClient(platform)
	if err != nil {
		return nil, err
	}

	if model == "" {
		model = "dall-e-3"
	}

	imageReq := openai.ImageRequest{
		Prompt: prompt,
		Model:  model,
		N:      1,
		Size:   "1024x1024",
	}

	ctx := context.Background()
	resp, err := client.CreateImage(ctx, imageReq)
	if err != nil {
		logrus.WithError(err).Error("Failed to generate image")
		return nil, err
	}

	urls := make([]string, len(resp.Data))
	for i, img := range resp.Data {
		urls[i] = img.URL
	}

	return urls, nil
}
