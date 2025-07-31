package services

import (
	"ai-models-backend/internal/models"
	"errors"
	"strconv"

	"gorm.io/gorm"
)

type BaseService struct {
	DB *gorm.DB
}

// ExistsByID 根据ID查找记录是否存在
func (s *BaseService) ExistsByID(model any, id uint64) bool {
	var count int64
	s.DB.Model(model).Where("id = ?", id).Count(&count)
	return count > 0
}

// ExistsByCondition 根据条件查找记录是否存在
func (s *BaseService) ExistsByCondition(model any, condition map[string]any) bool {
	var count int64
	s.DB.Model(model).Where(condition).Count(&count)
	return count > 0
}

// ExistsByConditionExcludeID 根据条件查找记录是否存在（排除指定ID）
func (s *BaseService) ExistsByConditionExcludeID(model any, condition map[string]any, excludeID uint64) bool {
	var count int64
	query := s.DB.Model(model).Where(condition).Where("id != ?", excludeID)
	query.Count(&count)
	return count > 0
}

// SoftDelete 软删除记录
func (s *BaseService) SoftDelete(model any, id uint64) error {
	result := s.DB.Delete(model, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("记录不存在")
	}
	return nil
}

// HardDelete 硬删除记录
func (s *BaseService) HardDelete(model any, id uint64) error {
	result := s.DB.Unscoped().Delete(model, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("记录不存在")
	}
	return nil
}

// UpdateField 更新单个字段
func (s *BaseService) UpdateField(model any, id uint64, field string, value any) error {
	result := s.DB.Model(model).Where("id = ?", id).Update(field, value)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("记录不存在")
	}
	return nil
}

// Paginate 分页查询
func (s *BaseService) Paginate(model any, dest any, page, limit int) (int64, error) {
	var total int64

	// 计算总数
	if err := s.DB.Model(model).Count(&total).Error; err != nil {
		return 0, err
	}

	// 分页查询
	offset := (page - 1) * limit
	if err := s.DB.Offset(offset).Limit(limit).Find(dest).Error; err != nil {
		return 0, err
	}

	return total, nil
}

// CreatePageResp 创建分页响应结构
func (s *BaseService) CreatePageResp(data any, page, limit int, total int64) map[string]any {
	return map[string]any{
		"data": data,
		"pagination": models.Pagination{
			Current:  page,
			PageSize: limit,
			Total:    int(total),
		},
	}
}

// Create 创建记录
func (s *BaseService) Create(model any) error {
	return s.DB.Create(model).Error
}

// GetByID 根据ID获取记录
func (s *BaseService) GetByID(model any, id uint64) error {
	result := s.DB.First(model, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return errors.New("记录不存在")
		}
		return result.Error
	}
	return nil
}

// GetAll 获取所有记录
func (s *BaseService) GetAll(model any, dest any) error {
	return s.DB.Find(dest).Error
}

// GetByCondition 根据条件获取记录
func (s *BaseService) GetByCondition(model any, dest any, condition map[string]any) error {
	return s.DB.Where(condition).Find(dest).Error
}

// Update 更新记录
func (s *BaseService) Update(model any, id uint64, updates map[string]any) error {
	result := s.DB.Model(model).Where("id = ?", id).Updates(updates)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("记录不存在")
	}
	return nil
}

// PaginateWithCondition 根据条件分页查询
func (s *BaseService) PaginateWithCondition(model any, dest any, page, limit int, condition map[string]any) (int64, error) {
	var total int64

	query := s.DB.Model(model)
	if len(condition) > 0 {
		query = query.Where(condition)
	}

	// 计算总数
	if err := query.Count(&total).Error; err != nil {
		return 0, err
	}

	// 分页查询
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(dest).Error; err != nil {
		return 0, err
	}

	return total, nil
}

// ParseStringToUint64 将字符串转换为uint64，统一处理ID转换
func (s *BaseService) ParseStringToUint64(str string) (uint64, error) {
	if str == "" {
		return 0, errors.New("ID不能为空")
	}

	id, err := strconv.ParseUint(str, 10, 64)
	if err != nil {
		return 0, errors.New("ID格式错误")
	}

	return id, nil
}
