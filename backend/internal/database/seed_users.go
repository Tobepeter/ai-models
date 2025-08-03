package database

import (
	"ai-models-backend/internal/models"
	"crypto/rand"
	"fmt"
	"math/big"

	"github.com/brianvoe/gofakeit/v6"
	"golang.org/x/crypto/bcrypt"
)

// seedCoreUsers 创建核心测试用户（固定数据，方便测试）
func (s *SeedManager) seedCoreUsers() ([]models.User, error) {
	// 生成固定的测试密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	coreUsers := []models.User{
		{
			Username:      "张三",
			Email:         "zhangsan@test.com",
			Password:      string(hashedPassword),
			PlainPassword: "123456",
			Avatar:        "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan",
			Status:        "😊 今天心情不错",
			Role:          models.RoleUser,
			IsActive:      true,
		},
		{
			Username:      "李四",
			Email:         "lisi@test.com",
			Password:      string(hashedPassword),
			PlainPassword: "123456",
			Avatar:        "https://api.dicebear.com/7.x/avataaars/svg?seed=lisi",
			Status:        "🎉 在学习新技术",
			Role:          models.RoleUser,
			IsActive:      true,
		},
		{
			Username:      "王五",
			Email:         "wangwu@test.com",
			Password:      string(hashedPassword),
			PlainPassword: "123456",
			Avatar:        "https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu",
			Status:        "💼 专注工作中",
			Role:          models.RoleUser,
			IsActive:      true,
		},
		{
			Username:      "赵六",
			Email:         "zhaoliu@test.com",
			Password:      string(hashedPassword),
			PlainPassword: "123456",
			Avatar:        "https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu",
			Status:        "🚀 追求进步",
			Role:          models.RoleUser, // 普通用户
			IsActive:      true,
		},
	}

	// 批量创建用户
	if err := DB.Create(&coreUsers).Error; err != nil {
		return nil, err
	}

	return coreUsers, nil
}

// seedRandomUsers 创建随机用户（模拟真实环境）
func (s *SeedManager) seedRandomUsers(count int) ([]models.User, error) {
	var users []models.User

	// 生成默认密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	for i := 0; i < count; i++ {
		// 生成随机用户数据
		firstName := gofakeit.FirstName()
		user := models.User{
			Username:      fmt.Sprintf("%s%d", firstName, i+1),
			Email:         gofakeit.Email(),
			Password:      string(hashedPassword),
			PlainPassword: "123456",
			Avatar:        fmt.Sprintf("https://api.dicebear.com/7.x/avataaars/svg?seed=%s%d", firstName, i+1),
			Status:        s.randomStatus(),
			Role:          models.RoleUser,
			IsActive:      true,
		}
		users = append(users, user)
	}

	// 批量创建用户
	if err := DB.Create(&users).Error; err != nil {
		return nil, err
	}

	return users, nil
}

// randomStatus 生成随机状态emoji和文字
func (s *SeedManager) randomStatus() string {
	statuses := []string{
		"😊 今天心情很好",
		"🎉 庆祝新成就",
		"💻 正在编码中",
		"📚 学习新知识",
		"🌟 追求卓越",
		"🚀 向着目标前进",
		"🎨 创作灵感爆发",
		"🏃‍♂️ 健身运动中",
		"🌈 生活多姿多彩",
		"💡 新想法涌现",
		"🎵 音乐相伴",
		"🌱 成长进步中",
		"⭐ 闪闪发光",
		"🔥 热情满满",
		"🌊 随波逐流",
		"",
		"",
		"",
	}

	randIdx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(statuses))))
	return statuses[randIdx.Int64()]
}