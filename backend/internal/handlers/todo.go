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

type TodoHandler struct {
	todoService *services.TodoService
}

func NewTodoHandler(todoService *services.TodoService) *TodoHandler {
	return &TodoHandler{
		todoService: todoService,
	}
}

// getUserID 从上下文获取用户ID
func (h *TodoHandler) getUserID(c *gin.Context) (uint, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "User not found in context")
		return 0, false
	}
	return userID.(uint), true
}

// @Summary 创建TODO
// @Description 创建新的TODO项，支持设置标题、描述、优先级、位置和截止日期。不指定position时自动分配到最后
// @ID createTodo
// @Tags TODO
// @Param request body models.TodoCreateRequest true "创建请求"
// @Success 200 {object} response.Response{data=models.TodoResponse}
// @Router /todos [post]
func (h *TodoHandler) Create(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok {
		return
	}

	var req models.TodoCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	todo, err := h.todoService.CreateTodo(userID, req)
	if err != nil {
		logrus.Error("Failed to create todo:", err)
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, todo.ToResponse())
}

// @Summary 根据ID获取TODO
// @Description 根据唯一标识符获取指定的TODO项详细信息
// @ID getTodoByID
// @Tags TODO
// @Param id path string true "TODO ID"
// @Success 200 {object} response.Response{data=models.TodoResponse}
// @Router /todos/{id} [get]
func (h *TodoHandler) GetByID(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok {
		return
	}

	idStr := c.Param("id")
	todoID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID")
		return
	}

	todo, err := h.todoService.GetTodoByID(userID, uint(todoID))
	if err != nil {
		logrus.Error("Failed to get todo:", err)
		if err.Error() == "TODO不存在" {
			response.Error(c, http.StatusNotFound, "TODO not found")
		} else {
			response.Error(c, http.StatusInternalServerError, "Failed to get TODO")
		}
		return
	}

	response.Success(c, todo.ToResponse())
}

// @Summary 获取TODO列表
// @Description 分页获取TODO列表，按position升序排列，支持按完成状态筛选
// @ID getTodoList
// @Tags TODO
// @Param page query int false "页码"
// @Param limit query int false "每页数量"
// @Param completed query boolean false "完成状态"
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /todos [get]
func (h *TodoHandler) GetList(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok {
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "0")) // 0表示使用默认的1000

	// 处理completed参数
	var completed *bool = nil
	if completedStr := c.Query("completed"); completedStr != "" {
		if completedVal, err := strconv.ParseBool(completedStr); err == nil {
			completed = &completedVal
		}
	}

	data, err := h.todoService.GetTodos(userID, page, limit, completed)
	if err != nil {
		logrus.Error("Failed to get todos:", err)
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(c, data)
}

// @Summary 更新TODO
// @Description 根据ID更新现有TODO项的内容，支持更新标题、描述、完成状态、优先级、位置等
// @ID updateTodo
// @Tags TODO
// @Param id path string true "TODO ID"
// @Param request body models.TodoUpdateRequest true "更新请求"
// @Success 200 {object} response.Response{data=models.TodoResponse}
// @Router /todos/{id} [put]
func (h *TodoHandler) Update(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok {
		return
	}

	idStr := c.Param("id")
	todoID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID")
		return
	}

	var req models.TodoUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	todo, err := h.todoService.UpdateTodo(userID, uint(todoID), req)
	if err != nil {
		logrus.Error("Failed to update todo:", err)
		if err.Error() == "TODO不存在" {
			response.Error(c, http.StatusNotFound, "TODO not found")
		} else {
			response.Error(c, http.StatusBadRequest, err.Error())
		}
		return
	}

	response.Success(c, todo.ToResponse())
}

// @Summary 批量更新TODO位置
// @Description 批量更新TODO项的位置，支持拖拽排序功能
// @ID updateTodoPositions
// @Tags TODO
// @Param request body models.TodoPositionUpdateRequest true "位置更新请求"
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /todos/positions [put]
func (h *TodoHandler) UpdatePositions(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok {
		return
	}

	var req models.TodoPositionUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	err := h.todoService.UpdateTodoPositions(userID, req)
	if err != nil {
		logrus.Error("Failed to update todo positions:", err)
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	response.SuccessMsg(c, "Positions updated successfully")
}

// @Summary 重新平衡TODO位置
// @Description 重新平衡所有TODO项的位置值，当位置值变得过小时使用
// @ID rebalanceTodoPositions
// @Tags TODO
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /todos/rebalance [post]
func (h *TodoHandler) RebalancePositions(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok {
		return
	}

	err := h.todoService.RebalancePositions(userID)
	if err != nil {
		logrus.Error("Failed to rebalance todo positions:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to rebalance positions")
		return
	}

	response.SuccessMsg(c, "Positions rebalanced successfully")
}

// @Summary 切换TODO完成状态
// @Description 快速切换TODO项的完成状态（完成/未完成）
// @ID toggleTodoComplete
// @Tags TODO
// @Param id path string true "TODO ID"
// @Success 200 {object} response.Response{data=models.TodoResponse}
// @Router /todos/{id}/toggle [patch]
func (h *TodoHandler) Toggle(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok {
		return
	}

	idStr := c.Param("id")
	todoID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID")
		return
	}

	todo, err := h.todoService.ToggleTodoComplete(userID, uint(todoID))
	if err != nil {
		logrus.Error("Failed to toggle todo:", err)
		if err.Error() == "TODO不存在" {
			response.Error(c, http.StatusNotFound, "TODO not found")
		} else {
			response.Error(c, http.StatusInternalServerError, "Failed to toggle TODO")
		}
		return
	}

	response.Success(c, todo.ToResponse())
}

// @Summary 删除TODO
// @Description 根据ID永久删除指定的TODO项，操作不可逆
// @ID deleteTodo
// @Tags TODO
// @Param id path string true "TODO ID"
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /todos/{id} [delete]
func (h *TodoHandler) Delete(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok {
		return
	}

	idStr := c.Param("id")
	todoID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID")
		return
	}

	err = h.todoService.DeleteTodo(userID, uint(todoID))
	if err != nil {
		logrus.Error("Failed to delete todo:", err)
		if err.Error() == "TODO不存在" {
			response.Error(c, http.StatusNotFound, "TODO not found")
		} else {
			response.Error(c, http.StatusInternalServerError, "Failed to delete TODO")
		}
		return
	}

	response.SuccessMsg(c, "TODO deleted successfully")
}

// @Summary 获取TODO统计信息
// @Description 获取TODO的统计信息，包括总数、完成数、待完成数
// @ID getTodoStats
// @Tags TODO
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /todos/stats [get]
func (h *TodoHandler) GetStats(c *gin.Context) {
	userID, ok := h.getUserID(c)
	if !ok {
		return
	}

	stats, err := h.todoService.GetTodoStats(userID)
	if err != nil {
		logrus.Error("Failed to get todo stats:", err)
		response.Error(c, http.StatusInternalServerError, "Failed to get TODO statistics")
		return
	}

	response.Success(c, stats)
}
