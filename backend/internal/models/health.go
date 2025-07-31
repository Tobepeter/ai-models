package models

// 健康检查响应
type HealthResponse struct {
	Status      string
	Timestamp   string
	Service     string
	Version     string
	Description string
	Message     string
}

// 就绪检查响应
type ReadyResponse struct {
	Status      string
	Timestamp   string
	Description string
	Message     string
	Checks      map[string]interface{}
}

// 存活检查响应
type LiveResponse struct {
	Status      string
	Timestamp   string
	Uptime      string
	Description string
	Message     string
}
