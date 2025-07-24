package middleware

import (
	"ai-models-backend/pkg/response"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/sirupsen/logrus"
)

// JWT 声明
type JWTClaims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// 认证中间件
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := extractToken(c)
		if err != nil {
			logrus.Error("Failed to extract token:", err)
			response.Error(c, http.StatusUnauthorized, "Authentication required")
			c.Abort()
			return
		}

		claims, err := validateToken(token)
		if err != nil {
			logrus.Error("Invalid token:", err)
			response.Error(c, http.StatusUnauthorized, "Invalid token")
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Next()
	}
}

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

func validateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (any, error) {
		// 方法类型必须是 HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(getJWTSecret()), nil
	})

	if err != nil {
		return nil, err
	}

	// token必须是指定的Claims类型
	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrTokenMalformed
}

// 生成token
func GenerateToken(userID uint, username string) (string, error) {
	claims := JWTClaims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "ai-models-backend",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(getJWTSecret()))
}

// 管理员权限中间件
func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 先验证用户身份
		token, err := extractToken(c)
		if err != nil {
			logrus.Error("Failed to extract token:", err)
			response.Error(c, http.StatusUnauthorized, "Authentication required")
			c.Abort()
			return
		}

		claims, err := validateToken(token)
		if err != nil {
			logrus.Error("Invalid token:", err)
			response.Error(c, http.StatusUnauthorized, "Invalid token")
			c.Abort()
			return
		}

		// 设置用户信息到上下文
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)

		// TODO: 这里应该检查用户是否为管理员，现在默认返回 true
		isAdmin := true // 临时默认为 true，后续需要从数据库查询用户角色
		if !isAdmin {
			response.Error(c, http.StatusForbidden, "Admin access required")
			c.Abort()
			return
		}

		c.Next()
	}
}

func getJWTSecret() string {
	return "your-secret-key-change-in-production"
}
