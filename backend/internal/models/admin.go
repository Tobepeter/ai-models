package models

// 管理员统计响应
type AdminStatsResponse struct {
	TotalUsers int `json:"total_users"`
	AdminUsers int `json:"admin_users"`
	SystemInfo map[string]interface{} `json:"system_info"`
}
