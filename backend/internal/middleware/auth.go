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
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(getJWTSecret()), nil
	})

	if err != nil {
		return nil, err
	}

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

func getJWTSecret() string {
	return "your-secret-key-change-in-production"
}