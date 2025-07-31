package models

// 管理员统计响应
type AdminStatsResponse struct {
	TotalUsers int
	AdminUsers int
	SystemInfo map[string]interface{}
}
