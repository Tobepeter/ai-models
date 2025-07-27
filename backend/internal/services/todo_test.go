package services

import (
	"ai-models-backend/internal/models"
	"ai-models-backend/internal/testutil"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestTodoService_CRUD(t *testing.T) {
	testutil.RunWithTestDB(t, func(t *testing.T) {
		// 创建用户
		userService := NewUserService(testutil.TestConfig)
		userReq := models.UserCreateRequest{
			Username: "testuser",
			Email:    "test@example.com",
			Password: "password123",
		}
		user, err := userService.CreateUser(userReq)
		require.NoError(t, err)
		assert.NotNil(t, user)

		// 确保测试结束后删除用户
		defer func() {
			_ = userService.DeleteUser(user.ID)
		}()

		todoService := NewTodoService()

		// 创建TODO
		todoReq := models.TodoCreateRequest{
			Title:       "Test TODO",
			Description: "This is a test TODO item",
			Priority:    1,
		}
		todo, err := todoService.CreateTodo(user.ID, todoReq)
		require.NoError(t, err)
		assert.NotNil(t, todo)
		assert.Equal(t, todoReq.Title, todo.Title)
		assert.Equal(t, todoReq.Description, todo.Description)
		assert.Equal(t, todoReq.Priority, todo.Priority)
		assert.False(t, todo.Completed)
		assert.NotZero(t, todo.Position)

		// 查询TODO
		todo2, err := todoService.GetTodoByID(user.ID, todo.ID)
		require.NoError(t, err)
		assert.Equal(t, todo.ID, todo2.ID)
		assert.Equal(t, todo.Title, todo2.Title)
		assert.Equal(t, todo.Description, todo2.Description)

		// 更新TODO
		newTitle := "Updated TODO"
		updateReq := models.TodoUpdateRequest{
			Title: newTitle,
		}
		todo3, err := todoService.UpdateTodo(user.ID, todo.ID, updateReq)
		require.NoError(t, err)
		assert.Equal(t, todo.ID, todo3.ID)
		assert.Equal(t, newTitle, todo3.Title)

		// 删除TODO
		err = todoService.DeleteTodo(user.ID, todo.ID)
		require.NoError(t, err)

		// 再查TODO应该找不到
		todo4, err := todoService.GetTodoByID(user.ID, todo.ID)
		assert.Error(t, err)
		assert.Nil(t, todo4)
		assert.Contains(t, err.Error(), "TODO不存在")
	})
}

func TestTodoService_InvalidRequests(t *testing.T) {
	testutil.RunWithTestDB(t, func(t *testing.T) {
		// 创建用户
		userService := NewUserService(testutil.TestConfig)
		userReq := models.UserCreateRequest{
			Username: "testuser2",
			Email:    "test2@example.com",
			Password: "password123",
		}
		user, err := userService.CreateUser(userReq)
		require.NoError(t, err)
		assert.NotNil(t, user)

		// 确保测试结束后删除用户
		defer func() {
			_ = userService.DeleteUser(user.ID)
		}()

		todoService := NewTodoService()

		// 获取不存在的TODO
		todo, err := todoService.GetTodoByID(user.ID, 99999)
		assert.Error(t, err)
		assert.Nil(t, todo)
		assert.Contains(t, err.Error(), "TODO不存在")

		// 更新不存在的TODO
		updateReq := models.TodoUpdateRequest{
			Title: "Updated Title",
		}
		todo2, err := todoService.UpdateTodo(user.ID, 99999, updateReq)
		assert.Error(t, err)
		assert.Nil(t, todo2)
		assert.Contains(t, err.Error(), "TODO不存在")

		// 删除不存在的TODO
		err = todoService.DeleteTodo(user.ID, 99999)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "TODO不存在")
	})
}

func TestTodoService_ToggleComplete(t *testing.T) {
	testutil.RunWithTestDB(t, func(t *testing.T) {
		// 创建用户
		userService := NewUserService(testutil.TestConfig)
		userReq := models.UserCreateRequest{
			Username: "testuser3",
			Email:    "test3@example.com",
			Password: "password123",
		}
		user, err := userService.CreateUser(userReq)
		require.NoError(t, err)
		assert.NotNil(t, user)

		// 确保测试结束后删除用户
		defer func() {
			_ = userService.DeleteUser(user.ID)
		}()

		todoService := NewTodoService()

		// 创建TODO
		todoReq := models.TodoCreateRequest{
			Title: "Test TODO for toggle",
		}
		todo, err := todoService.CreateTodo(user.ID, todoReq)
		require.NoError(t, err)
		assert.NotNil(t, todo)
		assert.False(t, todo.Completed)

		// 切换完成状态
		todo2, err := todoService.ToggleTodoComplete(user.ID, todo.ID)
		require.NoError(t, err)
		assert.True(t, todo2.Completed)

		// 再次切换完成状态
		todo3, err := todoService.ToggleTodoComplete(user.ID, todo.ID)
		require.NoError(t, err)
		assert.False(t, todo3.Completed)
	})
}

func TestTodoService_PositionAndStats(t *testing.T) {
	testutil.RunWithTestDB(t, func(t *testing.T) {
		// 创建用户
		userService := NewUserService(testutil.TestConfig)
		userReq := models.UserCreateRequest{
			Username: "testuser4",
			Email:    "test4@example.com",
			Password: "password123",
		}
		user, err := userService.CreateUser(userReq)
		require.NoError(t, err)
		assert.NotNil(t, user)

		// 确保测试结束后删除用户
		defer func() {
			_ = userService.DeleteUser(user.ID)
		}()

		todoService := NewTodoService()

		// 创建两个TODO
		todo1Req := models.TodoCreateRequest{
			Title: "First TODO",
		}
		todo1, err := todoService.CreateTodo(user.ID, todo1Req)
		require.NoError(t, err)
		assert.NotNil(t, todo1)

		todo2Req := models.TodoCreateRequest{
			Title: "Second TODO",
		}
		todo2, err := todoService.CreateTodo(user.ID, todo2Req)
		require.NoError(t, err)
		assert.NotNil(t, todo2)
		assert.True(t, todo2.Position > todo1.Position)

		// 获取统计信息
		stats, err := todoService.GetTodoStats(user.ID)
		require.NoError(t, err)
		assert.Equal(t, int64(2), stats["total"])
		assert.Equal(t, int64(0), stats["completed"])
		assert.Equal(t, int64(2), stats["pending"])

		// 标记一个为完成
		_, err = todoService.ToggleTodoComplete(user.ID, todo1.ID)
		require.NoError(t, err)

		// 再次获取统计信息
		stats2, err := todoService.GetTodoStats(user.ID)
		require.NoError(t, err)
		assert.Equal(t, int64(2), stats2["total"])
		assert.Equal(t, int64(1), stats2["completed"])
		assert.Equal(t, int64(1), stats2["pending"])

		// 获取TODO列表
		list, err := todoService.GetTodos(user.ID, 1, 10, nil)
		require.NoError(t, err)
		data, ok := list["data"].([]models.TodoResponse)
		require.True(t, ok)
		assert.Equal(t, 2, len(data))
	})
}

func TestTodoService_PositionUpdate(t *testing.T) {
	testutil.RunWithTestDB(t, func(t *testing.T) {
		// 创建用户
		userService := NewUserService(testutil.TestConfig)
		userReq := models.UserCreateRequest{
			Username: "testuser5",
			Email:    "test5@example.com",
			Password: "password123",
		}
		user, err := userService.CreateUser(userReq)
		require.NoError(t, err)
		assert.NotNil(t, user)

		// 确保测试结束后删除用户
		defer func() {
			_ = userService.DeleteUser(user.ID)
		}()

		todoService := NewTodoService()

		// 创建三个TODO
		todo1Req := models.TodoCreateRequest{
			Title: "First TODO",
		}
		todo1, err := todoService.CreateTodo(user.ID, todo1Req)
		require.NoError(t, err)
		assert.NotNil(t, todo1)

		todo2Req := models.TodoCreateRequest{
			Title: "Second TODO",
		}
		todo2, err := todoService.CreateTodo(user.ID, todo2Req)
		require.NoError(t, err)
		assert.NotNil(t, todo2)

		todo3Req := models.TodoCreateRequest{
			Title: "Third TODO",
		}
		todo3, err := todoService.CreateTodo(user.ID, todo3Req)
		require.NoError(t, err)
		assert.NotNil(t, todo3)

		// 更新位置 - 将第三个TODO移动到第一个位置
		positionReq := models.TodoPositionUpdateRequest{
			Items: []models.TodoPositionItem{
				{ID: todo3.ID, Position: 500},  // 移动到最前
				{ID: todo1.ID, Position: 1500}, // 原来第一个移到中间
				{ID: todo2.ID, Position: 2500}, // 原来第二个移到最后
			},
		}
		err = todoService.UpdateTodoPositions(user.ID, positionReq)
		require.NoError(t, err)

		// 获取列表验证位置更新
		list, err := todoService.GetTodos(user.ID, 1, 10, nil)
		require.NoError(t, err)
		data, ok := list["data"].([]models.TodoResponse)
		require.True(t, ok)
		assert.Equal(t, 3, len(data))
		assert.Equal(t, todo3.ID, data[0].ID)
		assert.Equal(t, todo1.ID, data[1].ID)
		assert.Equal(t, todo2.ID, data[2].ID)
	})
}

func TestTodoService_DueDate(t *testing.T) {
	testutil.RunWithTestDB(t, func(t *testing.T) {
		// 创建用户
		userService := NewUserService(testutil.TestConfig)
		userReq := models.UserCreateRequest{
			Username: "testuser6",
			Email:    "test6@example.com",
			Password: "password123",
		}
		user, err := userService.CreateUser(userReq)
		require.NoError(t, err)
		assert.NotNil(t, user)

		// 确保测试结束后删除用户
		defer func() {
			_ = userService.DeleteUser(user.ID)
		}()

		todoService := NewTodoService()

		// 创建带截止日期的TODO
		dueDate := time.Now().Add(24 * time.Hour)
		todoReq := models.TodoCreateRequest{
			Title:       "TODO with due date",
			Description: "This TODO has a due date",
			DueDate:     &dueDate,
		}
		todo, err := todoService.CreateTodo(user.ID, todoReq)
		require.NoError(t, err)
		assert.NotNil(t, todo)
		assert.Equal(t, dueDate.Unix(), todo.DueDate.Unix())
	})
}
