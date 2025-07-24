package services

import (
	"ai-models-backend/internal/database"
	"ai-models-backend/internal/models"
	"errors"

	"gorm.io/gorm"
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
		BaseService: BaseService{db: database.DB},
	}
}

// 创建记录 (内部使用，不包含认证逻辑)
func (s *CrudService) CreateCrud(req models.CrudCreateRequest) (*models.Crud, error) {
	model := &models.Crud{
		Data: req.Data,
	}

	// 保存到数据库
	if err := s.db.Create(model).Error; err != nil {
		return nil, err
	}

	return model, nil
}

// 根据ID获取记录
func (s *CrudService) GetCrudByID(id uint) (*models.Crud, error) {
	var crud models.Crud
	if err := s.db.First(&crud, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("记录不存在")
		}
		return nil, err
	}
	return &crud, nil
}

// 更新记录信息
func (s *CrudService) UpdateCrud(id uint, req models.CrudUpdateRequest) (*models.Crud, error) {
	var crud models.Crud
	if err := s.db.First(&crud, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("记录不存在")
		}
		return nil, err
	}

	// 更新数据
	crud.Data = req.Data

	// 保存更新
	if err := s.db.Save(&crud).Error; err != nil {
		return nil, err
	}

	return &crud, nil
}

// 获取记录列表
func (s *CrudService) GetCruds(page, limit int) (map[string]any, error) {
	var cruds []models.Crud

	// 使用基础服务的分页方法
	total, err := s.Paginate(&models.Crud{}, &cruds, page, limit)
	if err != nil {
		return nil, err
	}

	// 转换为响应格式
	var crudResponses []models.CrudResponse
	for _, crud := range cruds {
		crudResponses = append(crudResponses, crud.ToResponse())
	}

	// 使用基础服务创建标准分页响应
	return s.CreatePaginationResponse(crudResponses, page, limit, total), nil
}

// DeleteCrud 硬删除记录
func (s *CrudService) DeleteCrud(id uint) error {
	return s.HardDelete(&models.Crud{}, id)
}
