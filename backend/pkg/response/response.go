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

// 方法不允许响应
func MethodNotAllowed(c *gin.Context, message string) {
	if message == "" {
		message = "Method not allowed"
	}
	c.JSON(405, Response{
		Code:    405,
		Message: message,
	})
}

// 冲突响应 (409)
func Conflict(c *gin.Context, message string) {
	if message == "" {
		message = "Conflict occurred"
	}
	c.JSON(409, Response{
		Code:    409,
		Message: message,
	})
}

// 请求过大响应 (413)
func PayloadTooLarge(c *gin.Context, message string) {
	if message == "" {
		message = "Payload too large"
	}
	c.JSON(413, Response{
		Code:    413,
		Message: message,
	})
}

// 请求频率过高响应 (429)
func TooManyRequests(c *gin.Context, message string) {
	if message == "" {
		message = "Too many requests"
	}
	c.JSON(429, Response{
		Code:    429,
		Message: message,
	})
}

// 服务不可用响应 (503)
func ServiceUnavailable(c *gin.Context, message string) {
	if message == "" {
		message = "Service unavailable"
	}
	c.JSON(503, Response{
		Code:    503,
		Message: message,
	})
}
