package config

// CRUD防爆炸配置 - 简单的数据库条目限制
var (
	// 总条目限制
	CrudTotalLimit        = 100_000 // 允许写入的最大总条目数
	CrudTotalLimitEnabled = true    // 是否开启总条目限制

	// 分类条目限制
	CrudCategoryLimit        = 10_000 // 单个分类最大条目数
	CrudCategoryLimitEnabled = true   // 是否开启分类限制
)
