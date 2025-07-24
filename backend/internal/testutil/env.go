package testutil

import (
	"ai-models-backend/internal/config"
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/joho/godotenv"
)

// ProjectRoot 项目根目录路径
var ProjectRoot string

func init() {
	_, filename, _, _ := runtime.Caller(0)

	testutilDir := filepath.Dir(filename)
	internalDir := filepath.Dir(testutilDir)
	ProjectRoot = filepath.Dir(internalDir)
}

// LoadTestEnv 加载环境变量
func LoadTestEnv(t *testing.T) *config.Config {
	envLoaded := false
	envFiles := []string{
		filepath.Join(ProjectRoot, ".env"),
		filepath.Join(ProjectRoot, ".env.test"),
	}

	for _, envFile := range envFiles {
		if err := godotenv.Load(envFile); err == nil {
			envLoaded = true
			t.Logf("已加载环境变量文件: %s", envFile)
			break
		}
	}

	// 如果都没有找到，报错退出
	if !envLoaded {
		t.Fatalf("无法加载环境变量文件，请确保在项目根目录存在 .env 或 .env.test 文件\n项目根目录: %s", ProjectRoot)
	}

	validateProjectRoot(t)
	validateEnvs(t)

	// 测试环境不是docker，不能用docker内域名解析
	postgresHost := "localhost"

	return &config.Config{
		PostgresHost:     postgresHost,
		PostgresPort:     os.Getenv("POSTGRES_PORT"),
		PostgresUser:     os.Getenv("POSTGRES_USER"),
		PostgresPassword: os.Getenv("POSTGRES_PASSWORD"),
		PostgresDB:       os.Getenv("POSTGRES_DB"),
		JWTSecret:        os.Getenv("JWT_SECRET"),

		// OSS配置
		OSSAccessKeyID:     os.Getenv("OSS_ACCESS_KEY_ID"),
		OSSAccessKeySecret: os.Getenv("OSS_ACCESS_KEY_SECRET"),
		OSSBucket:          os.Getenv("OSS_BUCKET"),
		OSSRegion:          os.Getenv("OSS_REGION"),
		OSSRoleArn:         os.Getenv("OSS_ROLE_ARN"),

		IsDev:  true,
		IsProd: false,
		IsTest: true,
	}
}

// validateProjectRoot 验证项目根目录
func validateProjectRoot(t *testing.T) {
	if ProjectRoot == "" {
		t.Fatalf("项目根目录为空")
	}

	// 名字要是backend
	if filepath.Base(ProjectRoot) != "backend" {
		t.Fatalf("项目根目录名不是backend: %s", ProjectRoot)
	}

	// 需要包含go.mod
	goModPath := filepath.Join(ProjectRoot, "go.mod")
	if _, err := os.Stat(goModPath); os.IsNotExist(err) {
		t.Fatalf("项目根目录不包含go.mod文件: %s", goModPath)
	}
}

// validateEnvs 验证环境变量
func validateEnvs(t *testing.T) {
	envs := []string{
		"POSTGRES_PORT",
		"POSTGRES_USER",
		"POSTGRES_PASSWORD",
		"POSTGRES_DB",
		"JWT_SECRET",
	}
	var missingEnvs []string
	for _, env := range envs {
		if os.Getenv(env) == "" {
			missingEnvs = append(missingEnvs, env)
		}
	}
	if len(missingEnvs) > 0 {
		t.Fatalf("缺少必需的环境变量: %v", missingEnvs)
	}
}
