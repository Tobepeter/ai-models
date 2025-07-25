package middleware

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/services"
	"ai-models-backend/internal/services/auth"
	"ai-models-backend/pkg/response"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/sirupsen/logrus"
)

// AuthRequired 认证中间件
func AuthRequired(authService *auth.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := extractToken(c)
		if err != nil {
			logrus.Error("Failed to extract token:", err)
			response.Error(c, http.StatusUnauthorized, "Authentication required")
			c.Abort()
			return
		}

		claims, err := authService.ValidateToken(token)
		if err != nil {
			logrus.Error("Invalid token:", err)
			response.Error(c, http.StatusUnauthorized, "Invalid token")
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Next()
	}
}

// 提取token
func extractToken(c *gin.Context) (string, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return "", jwt.ErrTokenMalformed
	}

	if !strings.HasPrefix(authHeader, "Bearer ") {
		return "", jwt.ErrTokenMalformed
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	if token == "" {
		return "", jwt.ErrTokenMalformed
	}

	return token, nil
}

// AdminRequired 管理员权限中间件
func AdminRequired(authService *auth.AuthService, userService *services.UserService) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		if !config.AdminCheck {
			c.Next()
			return
		}

		// 先执行用户认证
		authMiddleware := AuthRequired(authService)
		authMiddleware(c)

		// 如果认证失败，AuthRequired 已经处理了响应和 Abort
		if c.IsAborted() {
			return
		}

		// 从上下文中获取用户ID (这里其实一定存在)
		userID, exists := c.Get("user_id")
		if !exists {
			response.Error(c, http.StatusInternalServerError, "User ID not found in context")
			c.Abort()
			return
		}

		// 认证成功，检查管理员权限
		isAdmin, err := userService.IsAdmin(userID.(uint))
		if err != nil {
			logrus.Error("Failed to check admin status:", err)
			response.Error(c, http.StatusInternalServerError, "Failed to verify admin status")
			c.Abort()
			return
		}

		if !isAdmin {
			response.Error(c, http.StatusForbidden, "Admin access required")
			c.Abort()
			return
		}

		c.Next()
	})
}
