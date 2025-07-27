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

// @Summary 创建记录
// @Description 创建新的数据记录，支持分类，数据是字符串，前端自行管理决定是否要json parse
// @ID create
// @Tags CRUD
// @Param request body models.CrudCreateRequest true "创建请求"
// @Success 200 {object} response.Response{data=models.CrudResponse}
// @Router /crud [post]
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

// @Summary 根据ID获取记录
// @Description 根据唯一标识符获取指定的数据记录详细信息
// @ID getByID
// @Tags CRUD
// @Param id path string true "记录ID"
// @Success 200 {object} response.Response{data=models.CrudResponse}
// @Router /crud/{id} [get]
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

// @Summary 获取记录列表
// @Description 分页获取数据记录列表，支持按分类筛选，返回分页信息和记录数据
// @ID getList
// @Tags CRUD
// @Param page query int false "页码"
// @Param limit query int false "每页数量"
// @Param category query string false "分类"
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /crud [get]
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

// @Summary 更新记录
// @Description 根据ID更新现有数据记录的内容，支持更新数据和分类信息
// @ID update
// @Tags CRUD
// @Param id path string true "记录ID"
// @Param request body models.CrudUpdateRequest true "更新请求"
// @Success 200 {object} response.Response{data=models.CrudResponse}
// @Router /crud/{id} [put]
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

// @Summary 删除记录
// @Description 根据ID永久删除指定的数据记录，操作不可逆，请谨慎使用
// @ID delete
// @Tags CRUD
// @Param id path string true "记录ID"
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /crud/{id} [delete]
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

	response.SuccessMsg(c, "Record deleted successfully")
}
