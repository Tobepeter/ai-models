package main

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/handlers"
	"ai-models-backend/internal/middleware"
	"ai-models-backend/internal/services"
	"ai-models-backend/internal/services/ai"
	"ai-models-backend/pkg/response"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

func main() {
	// 设置 logrus 为 JSON 格式
	logrus.SetFormatter(&logrus.JSONFormatter{})

	// 加载环境变量
	if err := godotenv.Load(); err != nil {
		logrus.Warn("未找到 .env 文件，使用系统环境变量")
	}

	cfg := config.New()
	userService := services.NewUserService()
	aiService := ai.NewAIService(cfg)
	ossService := services.NewOSSService(cfg)

	userHandler := handlers.NewUserHandler(userService)
	aiHandler := handlers.NewAIHandler(aiService)
	ossHandler := handlers.NewOSSHandler(ossService)
	healthHandler := handlers.NewHealthHandler()

	router := setupRouter(cfg, userHandler, aiHandler, ossHandler, healthHandler)

	logrus.Infof("服务器启动，端口: %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("服务器启动失败:", err)
	}
}

func setupRouter(cfg *config.Config, userHandler *handlers.UserHandler, aiHandler *handlers.AIHandler, ossHandler *handlers.OSSHandler, healthHandler *handlers.HealthHandler) *gin.Engine {
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(middleware.Logger())
	r.Use(middleware.Recovery())
	r.Use(middleware.CORS())

	r.GET("/health", healthHandler.Health)

	api := r.Group("/")
	{
		users := api.Group("/users")
		{
			users.POST("/register", userHandler.Register)
			users.POST("/login", userHandler.Login)
			users.GET("/profile", middleware.AuthRequired(), userHandler.GetProfile)
			users.PUT("/profile", middleware.AuthRequired(), userHandler.UpdateProfile)
		}

		ai := api.Group("/ai")
		ai.Use(middleware.AuthRequired())
		{
			ai.POST("/chat", aiHandler.Chat)
			ai.POST("/generate", aiHandler.Generate)
			ai.GET("/models", aiHandler.GetModels)
			ai.POST("/chat/completions", aiHandler.OpenAIChatCompletion)
		}

		// 新的 OpenAI 兼容接口（不需要登录）
		aiV1 := api.Group("/ai/v1")
		{
			aiV1.POST("/chat/completions", aiHandler.OpenAIChatCompletion)
			aiV1.POST("/images/generations", aiHandler.GenerateImages)
		}

		oss := api.Group("/oss")
		{
			// 客户端签名模式 - 获取签名和凭证
			oss.POST("/sts", ossHandler.GetSTSCredentials)
			oss.POST("/sign-to-upload", ossHandler.SignToUpload)
			oss.POST("/sign-to-fetch", ossHandler.SignToFetch)
			oss.POST("/hashify-name", ossHandler.HashifyName)
			oss.GET("/files", ossHandler.GetFileList)

			// 代理模式 - 后端全权代理操作
			oss.POST("/upload", handlers.FileSizeMiddleware(), ossHandler.UploadFile)
			oss.POST("/delete", ossHandler.DeleteFile)
			oss.POST("/get-url", ossHandler.GetFileURL)

			// 调试和状态接口
			oss.GET("/health", ossHandler.HealthCheck)
			oss.GET("/config", ossHandler.GetConfigInfo)
		}
	}

	r.NoRoute(func(c *gin.Context) {
		response.Error(c, http.StatusNotFound, "路由未找到")
	})

	return r
}
