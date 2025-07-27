package models

// 管理员统计响应
type AdminStatsResponse struct {
	TotalUsers int64                  `json:"total_users"`
	AdminUsers int64                  `json:"admin_users"`
	SystemInfo map[string]interface{} `json:"system_info"`
}
