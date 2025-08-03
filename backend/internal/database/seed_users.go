package database

import (
	"ai-models-backend/internal/models"
	"crypto/rand"
	"fmt"
	"math/big"

	"github.com/brianvoe/gofakeit/v6"
	"golang.org/x/crypto/bcrypt"
)

// seedTestUsers 创建测试用户（明确标记的测试数据）
func (s *SeedManager) seedTestUsers() ([]models.User, error) {
	// 生成固定的测试密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	testUsers := []models.User{
		{
			Username:      "test_user1",
			Email:         "test_user1@test.com",
			Password:      string(hashedPassword),
			PlainPassword: "123456",
			Avatar:        "https://api.dicebear.com/7.x/avataaars/svg?seed=test_user1",
			Status:        "😊 测试用户1",
			Role:          models.RoleUser,
			IsActive:      true,
		},
		{
			Username:      "test_user2",
			Email:         "test_user2@test.com",
			Password:      string(hashedPassword),
			PlainPassword: "123456",
			Avatar:        "https://api.dicebear.com/7.x/avataaars/svg?seed=test_user2",
			Status:        "🎉 测试用户2",
			Role:          models.RoleUser,
			IsActive:      true,
		},
		{
			Username:      "test_user3",
			Email:         "test_user3@test.com",
			Password:      string(hashedPassword),
			PlainPassword: "123456",
			Avatar:        "https://api.dicebear.com/7.x/avataaars/svg?seed=test_user3",
			Status:        "💼 测试用户3",
			Role:          models.RoleUser,
			IsActive:      true,
		},
		{
			Username:      "test_user4",
			Email:         "test_user4@test.com",
			Password:      string(hashedPassword),
			PlainPassword: "123456",
			Avatar:        "https://api.dicebear.com/7.x/avataaars/svg?seed=test_user4",
			Status:        "🚀 测试用户4",
			Role:          models.RoleUser,
			IsActive:      true,
		},
	}

	// 批量创建用户
	if err := DB.Create(&testUsers).Error; err != nil {
		return nil, err
	}

	return testUsers, nil
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