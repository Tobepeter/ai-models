package config

import (
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

type Config struct {
	Port        string
	Environment string
	IsAirDev    bool

	PostgresHost     string
	PostgresPort     string
	PostgresPassword string
	PostgresUser     string
	PostgresDB       string

	RedisHost     string
	RedisPort     string
	RedisPassword string

	JWTSecret     string
	JWTExpiration time.Duration

	SiliconAPIKey    string
	OpenRouterAPIKey string
	DashscopeAPIKey  string

	OSSAccessKeyID     string
	OSSAccessKeySecret string
	OSSBucket          string
	OSSRegion          string
	OSSRoleArn         string
	OSSReadAccess      string
	OSSWriteAccess     string
}

func New() *Config {
	// 开发环境加载 .env 文件
	isProd := os.Getenv("GO_ENV") == "production"

	if !isProd {
		godotenv.Load(".env")
	}

	isAirDev := os.Getenv("IS_AIR_DEV") == "true"
	postGresHost := os.Getenv("POSTGRES_HOST")
	if isAirDev {
		postGresHost = "localhost"
	}

	redisHost := os.Getenv("REDIS_HOST")
	if isAirDev {
		redisHost = "localhost"
	}

	config := &Config{
		Port:        os.Getenv("PORT"),
		Environment: os.Getenv("ENVIRONMENT"),
		IsAirDev:    isAirDev,

		PostgresHost:     postGresHost,
		PostgresPort:     os.Getenv("POSTGRES_PORT"),
		PostgresPassword: os.Getenv("POSTGRES_PASSWORD"),
		PostgresUser:     os.Getenv("POSTGRES_USER"),
		PostgresDB:       os.Getenv("POSTGRES_DB"),

		RedisHost:     redisHost,
		RedisPort:     os.Getenv("REDIS_PORT"),
		RedisPassword: os.Getenv("REDIS_PASSWORD"),

		JWTSecret:     os.Getenv("JWT_SECRET"),
		JWTExpiration: getEnvDuration("JWT_EXPIRATION", "24h"),

		SiliconAPIKey:    os.Getenv("SILICON_API_KEY"),
		OpenRouterAPIKey: os.Getenv("OPENROUTER_API_KEY"),
		DashscopeAPIKey:  os.Getenv("DASHSCOPE_API_KEY"),

		OSSAccessKeyID:     os.Getenv("OSS_ACCESS_KEY_ID"),
		OSSAccessKeySecret: os.Getenv("OSS_ACCESS_KEY_SECRET"),
		OSSBucket:          os.Getenv("OSS_BUCKET"),
		OSSRegion:          os.Getenv("OSS_REGION"),
		OSSRoleArn:         os.Getenv("OSS_ROLE_ARN"),
		OSSReadAccess:      os.Getenv("OSS_READ_ACCESS"),
		OSSWriteAccess:     os.Getenv("OSS_WRITE_ACCESS"),
	}

	if !isProd {
		logrus.WithField("config", config).Info("Config loaded")
	}

	return config
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
