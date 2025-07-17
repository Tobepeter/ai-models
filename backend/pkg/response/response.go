package response

import (
	"github.com/gin-gonic/gin"
)

// Response represents a standard API response structure
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Success sends a successful response
func Success(c *gin.Context, code int, message string, data interface{}) {
	c.JSON(code, Response{
		Code:    code,
		Message: message,
		Data:    data,
	})
}

// Error sends an error response
func Error(c *gin.Context, code int, message string) {
	c.JSON(code, Response{
		Code:    code,
		Message: message,
	})
}

// ErrorWithData sends an error response with additional data
func ErrorWithData(c *gin.Context, code int, message string, data interface{}) {
	c.JSON(code, Response{
		Code:    code,
		Message: message,
		Data:    data,
	})
}

// ValidationError sends a validation error response
func ValidationError(c *gin.Context, errors map[string]string) {
	c.JSON(400, Response{
		Code:    400,
		Message: "Validation failed",
		Data:    errors,
	})
}

// Unauthorized sends an unauthorized response
func Unauthorized(c *gin.Context, message string) {
	if message == "" {
		message = "Unauthorized"
	}
	c.JSON(401, Response{
		Code:    401,
		Message: message,
	})
}

// Forbidden sends a forbidden response
func Forbidden(c *gin.Context, message string) {
	if message == "" {
		message = "Forbidden"
	}
	c.JSON(403, Response{
		Code:    403,
		Message: message,
	})
}

// NotFound sends a not found response
func NotFound(c *gin.Context, message string) {
	if message == "" {
		message = "Resource not found"
	}
	c.JSON(404, Response{
		Code:    404,
		Message: message,
	})
}

// InternalError sends an internal server error response
func InternalError(c *gin.Context, message string) {
	if message == "" {
		message = "Internal server error"
	}
	c.JSON(500, Response{
		Code:    500,
		Message: message,
	})
}

// Created sends a created response
func Created(c *gin.Context, message string, data interface{}) {
	c.JSON(201, Response{
		Code:    201,
		Message: message,
		Data:    data,
	})
}

// Updated sends an updated response
func Updated(c *gin.Context, message string, data interface{}) {
	c.JSON(200, Response{
		Code:    200,
		Message: message,
		Data:    data,
	})
}

// Deleted sends a deleted response
func Deleted(c *gin.Context, message string) {
	c.JSON(200, Response{
		Code:    200,
		Message: message,
	})
}