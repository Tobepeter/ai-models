package handlers

import (
	"ai-models-backend/internal/models"
	"ai-models-backend/internal/services"
	"ai-models-backend/pkg/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type CrudHandler struct {
	crudService *services.CrudService
}

func NewCrudHandler(crudService *services.CrudService) *CrudHandler {
	return &CrudHandler{
		crudService: crudService,
	}
}

// Create 创建记录
func (h *CrudHandler) Create(c *gin.Context) {
	var req models.CrudCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	crud, err := h.crudService.CreateCrud(req)
	if err != nil {
		logrus.Error("Failed to create crud:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to create record")
		return
	}

	response.Success(c, crud.ToResponse())
}

// GetByID 根据ID获取记录
func (h *CrudHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID")
		return
	}

	crud, err := h.crudService.GetCrudByID(uint(id))
	if err != nil {
		logrus.Error("Failed to get crud:", err)
		if err.Error() == "记录不存在" {
			response.Error(c, http.StatusNotFound, "Record not found")
		} else {
			response.Error(c, http.StatusInternalServerError, "Failed to get record")
		}
		return
	}

	response.Success(c, crud.ToResponse())
}

// GetList 获取列表（支持分页和条件查询）
func (h *CrudHandler) GetList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	category := c.Query("category") // 获取category查询参数

	data, err := h.crudService.GetCruds(page, limit, category)
	if err != nil {
		logrus.Error("Failed to get cruds:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to get records")
		return
	}

	response.Success(c, data)
}

// Update 更新记录
func (h *CrudHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID")
		return
	}

	var req models.CrudUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	crud, err := h.crudService.UpdateCrud(uint(id), req)
	if err != nil {
		logrus.Error("Failed to update crud:", err)
		if err.Error() == "记录不存在" {
			response.Error(c, http.StatusNotFound, "Record not found")
		} else {
			response.Error(c, http.StatusBadRequest, err.Error())
		}
		return
	}

	response.Success(c, crud.ToResponse())
}

// Delete 删除记录
func (h *CrudHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID")
		return
	}

	err = h.crudService.DeleteCrud(uint(id))
	if err != nil {
		logrus.Error("Failed to delete crud:", err)
		if err.Error() == "记录不存在" {
			response.Error(c, http.StatusNotFound, "Record not found")
		} else {
			response.Error(c, http.StatusInternalServerError, "Failed to delete record")
		}
		return
	}

	response.Success(c, gin.H{"message": "Record deleted successfully"})
}
