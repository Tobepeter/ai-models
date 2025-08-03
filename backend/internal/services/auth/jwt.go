package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTClaims JWT 声明
// NOTE: 之类不需要设置 json tag，jwt内部使用 golang-jwt/jwt 转换为 user_id
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

// GenerateRefreshToken 生成refresh token (有效期更长)
func (s *AuthService) GenerateRefreshToken(userID uint64) (string, error) {
	// refresh token有效期为普通token的7倍，通常为7天
	refreshExpiration := s.config.JWTExpiration * 7

	claims := JWTClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(refreshExpiration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "ai-models-backend-refresh",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.getJWTSecret()))
}

// GenerateTokenPair 生成token和refresh token对
func (s *AuthService) GenerateTokenPair(userID uint64) (string, string, error) {
	token, err := s.GenerateToken(userID)
	if err != nil {
		return "", "", err
	}

	refreshToken, err := s.GenerateRefreshToken(userID)
	if err != nil {
		return "", "", err
	}

	return token, refreshToken, nil
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

// RefreshToken 使用refresh token刷新获取新的token对
func (s *AuthService) RefreshToken(refreshToken string) (string, string, error) {
	claims, err := s.ValidateToken(refreshToken)
	if err != nil {
		return "", "", err
	}

	// 检查是否是refresh token (通过issuer判断)
	if claims.Issuer != "ai-models-backend-refresh" {
		return "", "", errors.New("invalid refresh token")
	}

	// 生成新的token对
	newToken, newRefreshToken, err := s.GenerateTokenPair(claims.UserID)
	if err != nil {
		return "", "", err
	}

	return newToken, newRefreshToken, nil
}

// getJWTSecret 获取JWT密钥
func (s *AuthService) getJWTSecret() string {
	return s.config.JWTSecret
}
