package services

import (
	"ai-models-backend/internal/models"
	"ai-models-backend/internal/testutil"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

var (
	userA = models.UserCreateRequest{
		Username: "userA",
		Email:    "a@example.com",
		Password: "passwordA",
	}
	userB = models.UserCreateRequest{
		Username: "userA", // 用户名重复
		Email:    "b@example.com",
		Password: "passwordB",
	}
	userC = models.UserCreateRequest{
		Username: "userC",
		Email:    "a@example.com", // 邮箱重复
		Password: "passwordC",
	}
)

func TestUserService_CRUD(t *testing.T) {
	testutil.RunWithTestDB(t, func(t *testing.T) {
		userService := NewUserService(testutil.TestConfig)

		// 创建A
		a, err := userService.CreateUser(userA)
		require.NoError(t, err)
		assert.NotNil(t, a)
		assert.Equal(t, userA.Username, a.Username)
		assert.Equal(t, userA.Email, a.Email)
		assert.True(t, a.IsActive)
		assert.NotEmpty(t, a.Password)
		assert.NotEqual(t, userA.Password, a.Password)
		assert.NoError(t, bcrypt.CompareHashAndPassword([]byte(a.Password), []byte(userA.Password)))

		// 查询A
		a2, err := userService.GetUserByID(a.ID)
		require.NoError(t, err)
		assert.Equal(t, a.ID, a2.ID)
		assert.Equal(t, a.Username, a2.Username)
		assert.Equal(t, a.Email, a2.Email)

		// 创建用户名重复B
		b, err := userService.CreateUser(userB)
		assert.Error(t, err)
		assert.Nil(t, b)
		assert.Contains(t, err.Error(), "用户名已存在")

		// 创建邮箱重复C
		c, err := userService.CreateUser(userC)
		assert.Error(t, err)
		assert.Nil(t, c)
		assert.Contains(t, err.Error(), "邮箱已存在")

		// 删除A
		err = userService.DeleteUser(a.ID)
		require.NoError(t, err)

		// 再查A应该找不到
		a3, err := userService.GetUserByID(a.ID)
		assert.Error(t, err)
		assert.Nil(t, a3)
		assert.Contains(t, err.Error(), "用户不存在")
	})
}
