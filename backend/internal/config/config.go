package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port        string
	Environment string
	
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	
	RedisAddr     string
	RedisPassword string
	RedisDB       int
	
	JWTSecret     string
	JWTExpiration time.Duration
	
	AIAPIKey    string
	AIBaseURL   string
	AIModel     string
	AITimeout   time.Duration

	OSSAccessKeyID     string
	OSSAccessKeySecret string
	OSSBucket          string
	OSSRegion          string
	OSSRoleArn         string
	OSSReadAccess      string
	OSSWriteAccess     string
}

func New() *Config {
	return &Config{
		Port:        getEnv("PORT", "8080"),
		Environment: getEnv("ENVIRONMENT", "development"),
		
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "3306"),
		DBUser:     getEnv("DB_USER", "root"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "ai_models"),
		
		RedisAddr:     getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisDB:       getEnvInt("REDIS_DB", 0),
		
		JWTSecret:     getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		JWTExpiration: getEnvDuration("JWT_EXPIRATION", "24h"),
		
		AIAPIKey:  getEnv("AI_API_KEY", ""),
		AIBaseURL: getEnv("AI_BASE_URL", "https://api.openai.com/v1"),
		AIModel:   getEnv("AI_MODEL", "gpt-3.5-turbo"),
		AITimeout: getEnvDuration("AI_TIMEOUT", "30s"),

		OSSAccessKeyID:     getEnv("OSS_ACCESS_KEY_ID", ""),
		OSSAccessKeySecret: getEnv("OSS_ACCESS_KEY_SECRET", ""),
		OSSBucket:          getEnv("OSS_BUCKET", ""),
		OSSRegion:          getEnv("OSS_REGION", ""),
		OSSRoleArn:         getEnv("OSS_ROLE_ARN", ""),
		OSSReadAccess:      getEnv("OSS_READ_ACCESS", "sts"),
		OSSWriteAccess:     getEnv("OSS_WRITE_ACCESS", "sts"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getEnvDuration(key, defaultValue string) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	if duration, err := time.ParseDuration(defaultValue); err == nil {
		return duration
	}
	return time.Hour
}