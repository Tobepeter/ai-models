package ai

// Platform 表示AI平台类型
type Platform string

const (
	PlatformUnknown    Platform = "unknown"
	PlatformMock       Platform = "mock"
	PlatformSilicon    Platform = "silicon"
	PlatformOpenRouter Platform = "openrouter"
	PlatformDashScope  Platform = "dashscope"
)

// TextRequest 文本生成请求
type TextRequest struct {
	Model    string `json:"model"`
	Messages []struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	} `json:"messages"`
	Stream bool `json:"stream,omitempty"`
}

// TextResponse 文本生成响应
type TextResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Choices []struct {
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
}

// ImageRequest 图片生成请求
type ImageRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	N      int    `json:"n"`
	Size   string `json:"size"`
}

// ImageResponse 图片生成响应
type ImageResponse struct {
	Created int64 `json:"created"`
	Data    []struct {
		URL string `json:"url"`
	} `json:"data"`
}

// VideoRequest 视频生成请求
type VideoRequest struct {
	Model          string `json:"model"`
	Prompt         string `json:"prompt"`
	ImageSize      string `json:"image_size,omitempty"`
	NegativePrompt string `json:"negative_prompt,omitempty"`
	Image          string `json:"image,omitempty"`
}

// VideoResponse 视频生成响应
type VideoResponse struct {
	TaskID string `json:"task_id"`
}

// VideoStatusResponse 视频任务状态响应
type VideoStatusResponse struct {
	Status  string `json:"status"`
	Reason  string `json:"reason,omitempty"`
	Results struct {
		Videos []struct {
			URL string `json:"url"`
		} `json:"videos"`
		Timings struct {
			Inference float64 `json:"inference"`
		} `json:"timings"`
		Seed int64 `json:"seed"`
	} `json:"results,omitempty"`
}
