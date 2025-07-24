package services

import (
	"ai-models-backend/internal/models"
	"errors"

	"gorm.io/gorm"
)

/**
 * 通用服务基础结构体
 * 提供基础的CRUD操作方法
 */
type BaseService struct {
	db *gorm.DB
}

/* 根据ID查找记录是否存在 */
func (s *BaseService) ExistsByID(model any, id uint) bool {
	var count int64
	s.db.Model(model).Where("id = ?", id).Count(&count)
	return count > 0
}

/* 根据条件查找记录是否存在 */
func (s *BaseService) ExistsByCondition(model any, condition map[string]any) bool {
	var count int64
	s.db.Model(model).Where(condition).Count(&count)
	return count > 0
}

/* 根据条件查找记录是否存在（排除指定ID） */
func (s *BaseService) ExistsByConditionExcludeID(model any, condition map[string]any, excludeID uint) bool {
	var count int64
	query := s.db.Model(model).Where(condition).Where("id != ?", excludeID)
	query.Count(&count)
	return count > 0
}

/* 软删除记录 */
func (s *BaseService) SoftDelete(model any, id uint) error {
	result := s.db.Delete(model, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("记录不存在")
	}
	return nil
}

/* 更新单个字段 */
func (s *BaseService) UpdateField(model any, id uint, field string, value any) error {
	result := s.db.Model(model).Where("id = ?", id).Update(field, value)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("记录不存在")
	}
	return nil
}

/* 分页查询 */
func (s *BaseService) Paginate(model any, dest any, page, limit int) (int64, error) {
	var total int64

	// 计算总数
	if err := s.db.Model(model).Count(&total).Error; err != nil {
		return 0, err
	}

	// 分页查询
	offset := (page - 1) * limit
	if err := s.db.Offset(offset).Limit(limit).Find(dest).Error; err != nil {
		return 0, err
	}

	return total, nil
}

/* 创建分页响应结构 */
func (s *BaseService) CreatePaginationResponse(data any, page, limit int, total int64) map[string]any {
	return map[string]any{
		"data": data,
		"pagination": models.Pagination{
			Current:  page,
			PageSize: limit,
			Total:    total,
		},
	}
}
