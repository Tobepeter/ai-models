package main

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/database"
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

	// 初始化数据库
	if err := database.Initialize(cfg); err != nil {
		log.Fatal("数据库初始化失败:", err)
	}
	defer database.Close()

	userService := services.NewUserService(cfg)
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
	if cfg.IsProd {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(middleware.Logger())
	r.Use(middleware.Recovery())
	r.Use(middleware.CORS())

	r.Use(middleware.RateLimitLow()) // 全局 Low 限流

	r.GET("/health", healthHandler.Health)

	api := r.Group("/")
	{
		users := api.Group("/users")
		{
			// 公开接口
			users.POST("/register", userHandler.Register)
			users.POST("/login", userHandler.Login)
			
			// 用户自己的接口
			users.GET("/profile", middleware.AuthRequired(), userHandler.GetProfile)
			users.PUT("/profile", middleware.AuthRequired(), userHandler.UpdateProfile)
			users.POST("/change-password", middleware.AuthRequired(), userHandler.ChangePassword)
			
			// 管理员接口
			users.GET("/", middleware.AdminRequired(), userHandler.GetUsers)           // 获取用户列表
			users.GET("/:id", middleware.AdminRequired(), userHandler.GetUserByID)    // 根据ID获取用户
			users.DELETE("/:id", middleware.AdminRequired(), userHandler.DeleteUser)  // 删除用户
			users.POST("/:id/activate", middleware.AdminRequired(), userHandler.ActivateUser)     // 激活用户
			users.POST("/:id/deactivate", middleware.AdminRequired(), userHandler.DeactivateUser) // 停用用户
		}

		ai := api.Group("/ai/v1")
		ai.Use(middleware.RateLimitMid())
		{
			ai.POST("/chat/completions", aiHandler.OpenAIChatCompletion)
			ai.POST("/images/generations", aiHandler.GenerateImages)
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
		}
	}

	r.NoMethod(func(c *gin.Context) {
		response.MethodNotAllowed(c, "该路径不支持 "+c.Request.Method+" 方法")
	})

	r.HandleMethodNotAllowed = true // 处理 405 错误
	r.NoRoute(func(c *gin.Context) {
		response.Error(c, http.StatusNotFound, "路由未找到")
	})

	return r
}
