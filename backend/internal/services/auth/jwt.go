package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTClaims JWT 声明
type JWTClaims struct {
	UserID uint64
	jwt.RegisteredClaims
}

// GenerateToken 生成JWT token
func (s *AuthService) GenerateToken(userID uint64) (string, error) {
	claims := JWTClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.config.JWTExpiration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "ai-models-backend",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.getJWTSecret()))
}

// ValidateToken 验证JWT token
func (s *AuthService) ValidateToken(tokenString string) (*JWTClaims, error) {
	// 检查token是否在黑名单中
	if blacklist.IsBlacklisted(tokenString) {
		return nil, errors.New("token已失效")
	}

	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (any, error) {
		// 方法类型必须是 HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(s.getJWTSecret()), nil
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

// RefreshToken 刷新token
func (s *AuthService) RefreshToken(oldToken string) (string, error) {
	claims, err := s.ValidateToken(oldToken)
	if err != nil {
		return "", err
	}

	// 生成新的token
	return s.GenerateToken(claims.UserID)
}

// getJWTSecret 获取JWT密钥
func (s *AuthService) getJWTSecret() string {
	return s.config.JWTSecret
}
