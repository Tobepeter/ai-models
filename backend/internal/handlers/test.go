package handlers

import (
	"ai-models-backend/pkg/response"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type TestHandler struct{}

func NewTestHandler() *TestHandler {
	return &TestHandler{}
}

// @Summary 测试各种错误码
// @Description 用于测试前端对各种HTTP状态码和错误响应的处理，支持通过参数指定错误类型
// @Tags Test
// @Param type query string false "错误类型" Enums(400,401,403,404,405,409,413,429,500,503,validation,success)
// @Param message query string false "自定义错误消息"
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /test/err [get]
func (h *TestHandler) TestErrors(c *gin.Context) {
	errorType := c.DefaultQuery("type", "success")
	customMessage := c.Query("message")

	logrus.Infof("Testing error type: %s", errorType)

	switch errorType {
	case "400":
		msg := "Bad Request - 请求参数错误"
		if customMessage != "" {
			msg = customMessage
		}
		response.Error(c, http.StatusBadRequest, msg)

	case "401":
		msg := "Unauthorized - 未授权访问"
		if customMessage != "" {
			msg = customMessage
		}
		response.Unauthorized(c, msg)

	case "403":
		msg := "Forbidden - 禁止访问"
		if customMessage != "" {
			msg = customMessage
		}
		response.Forbidden(c, msg)

	case "404":
		msg := "Not Found - 资源未找到"
		if customMessage != "" {
			msg = customMessage
		}
		response.NotFound(c, msg)

	case "405":
		msg := "Method Not Allowed - 方法不允许"
		if customMessage != "" {
			msg = customMessage
		}
		response.MethodNotAllowed(c, msg)

	case "409":
		msg := "Conflict - 资源冲突"
		if customMessage != "" {
			msg = customMessage
		}
		response.Conflict(c, msg)

	case "413":
		msg := "Payload Too Large - 请求体过大"
		if customMessage != "" {
			msg = customMessage
		}
		response.PayloadTooLarge(c, msg)

	case "429":
		msg := "Too Many Requests - 请求过于频繁"
		if customMessage != "" {
			msg = customMessage
		}
		response.TooManyRequests(c, msg)

	case "500":
		msg := "Internal Server Error - 服务器内部错误"
		if customMessage != "" {
			msg = customMessage
		}
		response.InternalError(c, msg)

	case "503":
		msg := "Service Unavailable - 服务不可用"
		if customMessage != "" {
			msg = customMessage
		}
		response.ServiceUnavailable(c, msg)

	case "validation":
		// 测试验证错误
		errors := map[string]string{
			"username": "用户名长度必须在3-50个字符之间",
			"email":    "邮箱格式不正确",
			"password": "密码长度至少6个字符",
		}
		response.ValidationError(c, errors)

	case "success":
		fallthrough
	default:
		// 成功响应
		data := gin.H{
			"message":     "测试接口调用成功",
			"timestamp":   gin.H{"unix": 1234567890, "iso": "2023-01-01T00:00:00Z"},
			"server_info": gin.H{"version": "1.0.0", "environment": "test"},
			"test_data": gin.H{
				"numbers": []int{1, 2, 3, 4, 5},
				"strings": []string{"hello", "world", "test"},
				"nested": gin.H{
					"level1": gin.H{
						"level2": "deep value",
					},
				},
			},
		}
		response.Success(c, data)
	}
}

// @Summary 测试POST请求错误处理
// @Description 测试POST请求的各种错误情况，包括JSON解析错误、参数验证等
// @Tags Test
// @Param request body map[string]any false "测试请求体"
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /test/err [post]
func (h *TestHandler) TestPostErrors(c *gin.Context) {
	var req map[string]interface{}

	// 测试JSON绑定错误
	if err := c.ShouldBindJSON(&req); err != nil {
		logrus.Error("Invalid JSON body:", err)
		response.Error(c, http.StatusBadRequest, "Invalid JSON format: "+err.Error())
		return
	}

	// 检查是否有错误类型参数
	if errorType, exists := req["error_type"]; exists {
		switch errorType {
		case "server_error":
			response.InternalError(c, "模拟服务器内部错误")
			return
		case "forbidden":
			response.Forbidden(c, "模拟权限不足")
			return
		case "conflict":
			response.Conflict(c, "模拟资源冲突")
			return
		}
	}

	// 成功响应
	data := gin.H{
		"message":       "POST请求处理成功",
		"received_data": req,
		"processed_at":  "2023-01-01T00:00:00Z",
	}
	response.Success(c, data)
}

// @Summary 测试路径参数错误
// @Description 测试带路径参数的请求错误处理
// @Tags Test
// @Param id path string true "测试ID"
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /test/err/param/{id} [get]
func (h *TestHandler) TestParamErrors(c *gin.Context) {
	idStr := c.Param("id")

	// 测试参数解析
	if idStr == "invalid" {
		response.Error(c, http.StatusBadRequest, "Invalid ID parameter")
		return
	}

	if idStr == "notfound" {
		response.NotFound(c, "Resource with ID "+idStr+" not found")
		return
	}

	// 尝试解析为数字
	if id, err := strconv.Atoi(idStr); err != nil {
		response.Error(c, http.StatusBadRequest, "ID must be a valid number")
		return
	} else {
		data := gin.H{
			"message": "参数解析成功",
			"id":      id,
			"id_str":  idStr,
			"type":    "numeric",
		}
		response.Success(c, data)
	}
}

// @Summary 测试特定错误码
// @Description 根据路径参数返回对应的错误码，用于测试前端错误处理
// @Tags Test
// @Param code path string true "错误码" Enums(400,401,403,404,405,409,413,429,500,503)
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /test/err/code/{code} [get]
func (h *TestHandler) TestSpecificError(c *gin.Context) {
	code := c.Param("code")

	logrus.Infof("Testing specific error code: %s", code)

	switch code {
	case "400":
		response.Error(c, http.StatusBadRequest, "测试400错误 - 请求参数无效")
	case "401":
		response.Unauthorized(c, "测试401错误 - 身份验证失败")
	case "403":
		response.Forbidden(c, "测试403错误 - 权限不足")
	case "404":
		response.NotFound(c, "测试404错误 - 资源不存在")
	case "405":
		response.MethodNotAllowed(c, "测试405错误 - 方法不被允许")
	case "409":
		response.Conflict(c, "测试409错误 - 资源冲突")
	case "413":
		response.PayloadTooLarge(c, "测试413错误 - 请求体过大")
	case "429":
		response.TooManyRequests(c, "测试429错误 - 请求过于频繁")
	case "500":
		response.InternalError(c, "测试500错误 - 服务器内部错误")
	case "503":
		response.ServiceUnavailable(c, "测试503错误 - 服务不可用")
	default:
		response.Error(c, http.StatusBadRequest, "不支持的错误码: "+code)
	}
}

// @Summary 测试网络错误模拟
// @Description 模拟各种网络错误情况，如超时、连接失败等
// @Tags Test
// @Param type path string true "网络错误类型" Enums(timeout,connection,dns,ssl)
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /test/err/network/{type} [get]
func (h *TestHandler) TestNetworkError(c *gin.Context) {
	errorType := c.Param("type")

	logrus.Infof("Testing network error type: %s", errorType)

	switch errorType {
	case "timeout":
		response.ErrorWithData(c, http.StatusRequestTimeout, "请求超时", gin.H{
			"error_type":  "timeout",
			"timeout_ms":  30000,
			"retry_after": 5,
		})
	case "connection":
		response.ErrorWithData(c, http.StatusServiceUnavailable, "连接失败", gin.H{
			"error_type":  "connection_failed",
			"details":     "无法连接到上游服务",
			"retry_after": 10,
		})
	case "dns":
		response.ErrorWithData(c, http.StatusServiceUnavailable, "DNS解析失败", gin.H{
			"error_type":  "dns_resolution_failed",
			"domain":      "api.example.com",
			"retry_after": 30,
		})
	case "ssl":
		response.ErrorWithData(c, http.StatusServiceUnavailable, "SSL证书验证失败", gin.H{
			"error_type": "ssl_verification_failed",
			"details":    "证书已过期或不受信任",
		})
	default:
		response.Error(c, http.StatusBadRequest, "不支持的网络错误类型: "+errorType)
	}
}

// @Summary 测试业务错误
// @Description 模拟各种业务逻辑错误
// @Tags Test
// @Param type path string true "业务错误类型" Enums(validation,auth,permission,quota,maintenance)
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /test/err/business/{type} [get]
func (h *TestHandler) TestBusinessError(c *gin.Context) {
	errorType := c.Param("type")

	logrus.Infof("Testing business error type: %s", errorType)

	switch errorType {
	case "validation":
		errors := map[string]string{
			"email": "邮箱格式不正确",
			"phone": "手机号码格式错误",
			"age":   "年龄必须在18-100之间",
		}
		response.ValidationError(c, errors)
	case "auth":
		response.ErrorWithData(c, http.StatusUnauthorized, "登录已过期", gin.H{
			"error_code":   "TOKEN_EXPIRED",
			"expired_at":   "2023-01-01T00:00:00Z",
			"redirect_url": "/login",
		})
	case "permission":
		response.ErrorWithData(c, http.StatusForbidden, "权限不足", gin.H{
			"error_code":    "INSUFFICIENT_PERMISSION",
			"required_role": "admin",
			"current_role":  "user",
		})
	case "quota":
		response.ErrorWithData(c, http.StatusTooManyRequests, "配额已用完", gin.H{
			"error_code": "QUOTA_EXCEEDED",
			"limit":      1000,
			"used":       1000,
			"reset_time": "2023-01-02T00:00:00Z",
		})
	case "maintenance":
		response.ErrorWithData(c, http.StatusServiceUnavailable, "系统维护中", gin.H{
			"error_code":         "SYSTEM_MAINTENANCE",
			"maintenance_until":  "2023-01-01T06:00:00Z",
			"estimated_duration": "2小时",
		})
	default:
		response.Error(c, http.StatusBadRequest, "不支持的业务错误类型: "+errorType)
	}
}
