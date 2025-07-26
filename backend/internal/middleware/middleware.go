package middleware

import (
	"ai-models-backend/pkg/response"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// Logger returns a gin.HandlerFunc for logging requests
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// Process request
		c.Next()

		// Calculate latency
		latency := time.Since(start)

		// Get status code
		statusCode := c.Writer.Status()

		// Get client IP
		clientIP := c.ClientIP()

		// Log format
		logrus.WithFields(logrus.Fields{
			"status_code": statusCode,
			"latency":     latency,
			"client_ip":   clientIP,
			"method":      c.Request.Method,
			"path":        path,
			"raw_query":   raw,
			"user_agent":  c.Request.UserAgent(),
		}).Info("Request processed")
	}
}

// Recovery returns a gin.HandlerFunc for recovering from panics
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				logrus.WithFields(logrus.Fields{
					"error": r,
					"path":  c.Request.URL.Path,
				}).Error("Panic recovered")

				response.Error(c, http.StatusInternalServerError, "Internal server error")
				c.Abort()
			}
		}()
		c.Next()
	}
}

// CORS returns a gin.HandlerFunc for handling CORS
func CORS(isDev bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")

		// dev 不要缓存 CORS
		if isDev {
			c.Header("Access-Control-Max-Age", "0")
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// RateLimiter returns a gin.HandlerFunc for rate limiting
func RateLimiter() gin.HandlerFunc {
	// This is a simple in-memory rate limiter
	// In production, you should use Redis or similar
	return func(c *gin.Context) {
		// Implementation would go here
		c.Next()
	}
}

// RequestID returns a gin.HandlerFunc that adds a request ID to the context
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = generateRequestID()
		}
		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}

// generateRequestID generates a unique request ID
func generateRequestID() string {
	// Simple implementation - in production, use UUID or similar
	return "req-" + string(rune(time.Now().UnixNano()))
}
