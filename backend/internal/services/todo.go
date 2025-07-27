package services

import (
	"ai-models-backend/internal/database"
	"ai-models-backend/internal/models"
	"errors"

	"gorm.io/gorm"
)

/**
 * TODO服务
 * 提供TODO相关的业务逻辑处理
 */
type TodoService struct {
	BaseService
}

func NewTodoService() *TodoService {
	return &TodoService{
		BaseService: BaseService{DB: database.DB},
	}
}

// CreateTodo 创建TODO
func (s *TodoService) CreateTodo(userID uint, req models.TodoCreateRequest) (*models.Todo, error) {
	position := float64(0)

	// 如果没有指定位置，自动分配到最后
	if req.Position == nil {
		var maxPosition float64
		s.DB.Model(&models.Todo{}).Where("user_id = ?", userID).Select("COALESCE(MAX(position), 0)").Scan(&maxPosition)
		position = maxPosition + 1000 // 给新项目较大的间隔，便于后续插入
	} else {
		position = *req.Position
	}

	todo := &models.Todo{
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		Priority:    req.Priority,
		Position:    position,
		DueDate:     req.DueDate,
		Completed:   false, // 新创建的TODO默认未完成
	}

	// 保存到数据库
	if err := s.DB.Create(todo).Error; err != nil {
		return nil, err
	}

	return todo, nil
}

// GetTodoByID 根据ID获取TODO（仅限用户自己的）
func (s *TodoService) GetTodoByID(userID, todoID uint) (*models.Todo, error) {
	var todo models.Todo
	if err := s.DB.Where("id = ? AND user_id = ?", todoID, userID).First(&todo).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("TODO不存在")
		}
		return nil, err
	}
	return &todo, nil
}

// UpdateTodo 更新TODO信息（仅限用户自己的）
func (s *TodoService) UpdateTodo(userID, todoID uint, req models.TodoUpdateRequest) (*models.Todo, error) {
	var todo models.Todo
	if err := s.DB.Where("id = ? AND user_id = ?", todoID, userID).First(&todo).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("TODO不存在")
		}
		return nil, err
	}

	// 只更新非零值字段，利用Go的零值特性
	updates := make(map[string]any)

	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Completed != nil {
		updates["completed"] = *req.Completed
	}
	if req.Priority != 0 {
		updates["priority"] = req.Priority
	}
	if req.Position != nil {
		updates["position"] = *req.Position
	}
	if req.DueDate != nil {
		updates["due_date"] = req.DueDate
	}

	// 如果有字段需要更新，执行更新
	if len(updates) > 0 {
		if err := s.DB.Model(&todo).Updates(updates).Error; err != nil {
			return nil, err
		}
		// 重新查询获取最新数据
		if err := s.DB.Where("id = ? AND user_id = ?", todoID, userID).First(&todo).Error; err != nil {
			return nil, err
		}
	}

	return &todo, nil
}

// GetTodos 获取用户的TODO列表（按位置排序）
func (s *TodoService) GetTodos(userID uint, page, limit int, completed *bool) (map[string]any, error) {
	var todos []models.Todo

	// 如果前端没有提供分页参数，使用大的默认值
	if limit == 0 {
		limit = 1000
	}

	query := s.DB.Model(&models.Todo{}).Where("user_id = ?", userID)

	// 根据完成状态过滤
	if completed != nil {
		query = query.Where("completed = ?", *completed)
	}

	// 按位置排序
	query = query.Order("position ASC")

	// 计算总数
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, err
	}

	// 分页查询
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&todos).Error; err != nil {
		return nil, err
	}

	// 转换为响应格式
	var resp []models.TodoResponse
	for _, todo := range todos {
		resp = append(resp, todo.ToResponse())
	}

	// 使用基础服务创建标准分页响应
	return s.CreatePageResp(resp, page, limit, total), nil
}

// UpdateTodoPositions 批量更新TODO位置（支持拖拽排序）
func (s *TodoService) UpdateTodoPositions(userID uint, req models.TodoPositionUpdateRequest) error {
	return s.DB.Transaction(func(tx *gorm.DB) error {
		for _, item := range req.Items {
			// 验证TODO是否属于当前用户
			var count int64
			if err := tx.Model(&models.Todo{}).Where("id = ? AND user_id = ?", item.ID, userID).Count(&count).Error; err != nil {
				return err
			}
			if count == 0 {
				return errors.New("TODO不存在或无权限")
			}

			// 更新位置
			if err := tx.Model(&models.Todo{}).Where("id = ? AND user_id = ?", item.ID, userID).Update("position", item.Position).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// ToggleTodoComplete 切换TODO完成状态（仅限用户自己的）
func (s *TodoService) ToggleTodoComplete(userID, todoID uint) (*models.Todo, error) {
	var todo models.Todo
	if err := s.DB.Where("id = ? AND user_id = ?", todoID, userID).First(&todo).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("TODO不存在")
		}
		return nil, err
	}

	// 切换完成状态
	todo.Completed = !todo.Completed

	// 保存更新
	if err := s.DB.Save(&todo).Error; err != nil {
		return nil, err
	}

	return &todo, nil
}

// DeleteTodo 硬删除TODO（仅限用户自己的）
func (s *TodoService) DeleteTodo(userID, todoID uint) error {
	result := s.DB.Where("id = ? AND user_id = ?", todoID, userID).Delete(&models.Todo{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("TODO不存在")
	}
	return nil
}

// GetTodoStats 获取用户的TODO统计信息
func (s *TodoService) GetTodoStats(userID uint) (map[string]any, error) {
	var total, completed, pending int64

	// 总数
	if err := s.DB.Model(&models.Todo{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return nil, err
	}

	// 已完成数量
	if err := s.DB.Model(&models.Todo{}).Where("user_id = ? AND completed = ?", userID, true).Count(&completed).Error; err != nil {
		return nil, err
	}

	// 待完成数量
	pending = total - completed

	return map[string]any{
		"total":     total,
		"completed": completed,
		"pending":   pending,
	}, nil
}

// RebalancePositions 重新平衡位置值（当位置值变得过小时使用）
func (s *TodoService) RebalancePositions(userID uint) error {
	var todos []models.Todo
	if err := s.DB.Where("user_id = ?", userID).Order("position ASC").Find(&todos).Error; err != nil {
		return err
	}

	return s.DB.Transaction(func(tx *gorm.DB) error {
		for i, todo := range todos {
			newPosition := float64((i + 1) * 1000) // 重新分配位置，间隔1000
			if err := tx.Model(&todo).Update("position", newPosition).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
