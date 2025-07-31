package services

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/database"
	"ai-models-backend/internal/models"
	"errors"
	"fmt"

	"gorm.io/gorm"
)

const (
	CrudDefaultCategory = "general"
)

/**
 * CRUD服务
 * 提供通用CRUD相关的业务逻辑处理
 */
type CrudService struct {
	BaseService
}

func NewCrudService() *CrudService {
	return &CrudService{
		BaseService: BaseService{DB: database.DB},
	}
}

// CreateCrud 创建记录
func (s *CrudService) CreateCrud(req models.CrudCreateRequest) (*models.Crud, error) {
	category := req.Category

	// 如果category为空，使用默认分类
	if category == "" {
		category = CrudDefaultCategory
	}

	// 防爆炸检查
	if err := s.checkLimitsBeforeCreate(req.Data, category); err != nil {
		return nil, err
	}

	model := &models.Crud{
		Category: category,
		Data:     req.Data,
	}

	// 保存到数据库
	if err := s.DB.Create(model).Error; err != nil {
		return nil, err
	}

	return model, nil
}

// checkLimitsBeforeCreate 创建前的限制检查
func (s *CrudService) checkLimitsBeforeCreate(data, category string) error {
	// 1. 检查总记录数限制
	if config.CrudTotalLimitEnabled {
		var totalCount int64
		if err := s.DB.Model(&models.Crud{}).Count(&totalCount).Error; err != nil {
			return fmt.Errorf("查询总记录数失败: %v", err)
		}
		if totalCount >= int64(config.CrudTotalLimit) {
			return fmt.Errorf("总记录数已达上限 %d 条，无法创建新记录", config.CrudTotalLimit)
		}
	}

	// 2. 检查分类记录数限制
	if config.CrudCategoryLimitEnabled {
		var categoryCount int64
		if err := s.DB.Model(&models.Crud{}).Where("category = ?", category).Count(&categoryCount).Error; err != nil {
			return fmt.Errorf("查询分类记录数失败: %v", err)
		}
		if categoryCount >= int64(config.CrudCategoryLimit) {
			return fmt.Errorf("分类 '%s' 记录数已达上限 %d 条，无法创建新记录", category, config.CrudCategoryLimit)
		}
	}

	return nil
}

// GetCrudByID 根据ID获取记录
func (s *CrudService) GetCrudByID(id uint64) (*models.Crud, error) {
	var crud models.Crud
	if err := s.DB.First(&crud, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("记录不存在")
		}
		return nil, err
	}
	return &crud, nil
}

// UpdateCrud 更新记录信息
func (s *CrudService) UpdateCrud(id uint64, req models.CrudUpdateRequest) (*models.Crud, error) {
	var crud models.Crud
	if err := s.DB.First(&crud, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("记录不存在")
		}
		return nil, err
	}

	// 更新数据
	if req.Category != "" {
		crud.Category = req.Category
	}
	crud.Data = req.Data

	// 保存更新
	if err := s.DB.Save(&crud).Error; err != nil {
		return nil, err
	}

	return &crud, nil
}

// GetCruds 获取记录列表
func (s *CrudService) GetCruds(page, limit int, category string) (map[string]any, error) {
	var cruds []models.Crud
	condition := make(map[string]any)

	// 如果指定了category，添加过滤条件
	if category != "" {
		condition["category"] = category
	} else {
		condition["category"] = CrudDefaultCategory
	}

	// 使用基础服务的分页方法
	total, err := s.PaginateWithCondition(&models.Crud{}, &cruds, page, limit, condition)
	if err != nil {
		return nil, err
	}

	// 转换为响应格式
	var resp []models.CrudResponse
	for _, crud := range cruds {
		resp = append(resp, crud.ToResponse())
	}

	// 使用基础服务创建标准分页响应
	return s.CreatePageResp(resp, page, limit, total), nil
}

// DeleteCrud 硬删除记录
func (s *CrudService) DeleteCrud(id uint64) error {
	return s.HardDelete(&models.Crud{}, id)
}
