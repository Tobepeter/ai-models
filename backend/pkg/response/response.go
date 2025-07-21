package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// 标准API响应结构
type Response struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

// 成功响应
func Success(c *gin.Context, data any) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "ok",
		Data:    data,
	})
}

// 成功响应带消息
func SuccessMsg(c *gin.Context, message string) {
	c.JSON(200, Response{
		Code:    0,
		Message: message,
		Data:    nil,
	})
}

// 错误响应
func Error(c *gin.Context, code int, message string) {
	c.JSON(code, Response{
		Code:    code,
		Message: message,
	})
}

// 错误响应带数据
func ErrorWithData(c *gin.Context, code int, message string, data any) {
	c.JSON(code, Response{
		Code:    code,
		Message: message,
		Data:    data,
	})
}

// 验证错误响应
func ValidationError(c *gin.Context, errors map[string]string) {
	c.JSON(400, Response{
		Code:    400,
		Message: "Validation failed",
		Data:    errors,
	})
}

// 未授权响应
func Unauthorized(c *gin.Context, message string) {
	if message == "" {
		message = "Unauthorized"
	}
	c.JSON(401, Response{
		Code:    401,
		Message: message,
	})
}

// 禁止访问响应
func Forbidden(c *gin.Context, message string) {
	if message == "" {
		message = "Forbidden"
	}
	c.JSON(403, Response{
		Code:    403,
		Message: message,
	})
}

// 未找到响应
func NotFound(c *gin.Context, message string) {
	if message == "" {
		message = "Resource not found"
	}
	c.JSON(404, Response{
		Code:    404,
		Message: message,
	})
}

// 内部错误响应
func InternalError(c *gin.Context, message string) {
	if message == "" {
		message = "Internal server error"
	}
	c.JSON(500, Response{
		Code:    500,
		Message: message,
	})
}

// 创建成功响应
func Created(c *gin.Context, message string, data any) {
	c.JSON(201, Response{
		Code:    201,
		Message: message,
		Data:    data,
	})
}

// 更新成功响应
func Updated(c *gin.Context, message string, data any) {
	c.JSON(200, Response{
		Code:    200,
		Message: message,
		Data:    data,
	})
}

// 删除成功响应
func Deleted(c *gin.Context, message string) {
	c.JSON(200, Response{
		Code:    200,
		Message: message,
	})
}
