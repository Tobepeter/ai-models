package models

// 健康检查响应
type HealthResponse struct {
	Status      string `json:"status"`
	Timestamp   string `json:"timestamp"`
	Service     string `json:"service"`
	Version     string `json:"version"`
	Description string `json:"description"`
	Message     string `json:"message"`
}

// 就绪检查响应
type ReadyResponse struct {
	Status      string `json:"status"`
	Timestamp   string `json:"timestamp"`
	Description string `json:"description"`
	Message     string `json:"message"`
	Checks      map[string]interface{} `json:"checks"`
}

// 存活检查响应
type LiveResponse struct {
	Status      string `json:"status"`
	Timestamp   string `json:"timestamp"`
	Uptime      string `json:"uptime"`
	Description string `json:"description"`
	Message     string `json:"message"`
}
