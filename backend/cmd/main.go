// @title AI Models API
// @version 1.0
// @description AI Models Backend API documentation
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@example.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /
// @schemes http https

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

package main

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/database"
	"ai-models-backend/internal/handlers"
	"ai-models-backend/internal/middleware"
	"ai-models-backend/internal/services"
	"ai-models-backend/internal/services/ai"
	"ai-models-backend/internal/services/auth"
	"ai-models-backend/pkg/response"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "ai-models-backend/docs" // 导入生成的docs包
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
	authService := auth.NewAuthService(cfg)

	// 初始化默认管理员用户
	if err := authService.CreateDefaultAdmin(); err != nil {
		logrus.Warn("创建默认管理员用户失败:", err)
	}

	aiService := ai.NewAIService(cfg)
	ossService := services.NewOSSService(cfg)
	crudService := services.NewCrudService()

	userHandler := handlers.NewUserHandler(userService, authService)
	adminHandler := handlers.NewAdminHandler(userService, authService)
	aiHandler := handlers.NewAIHandler(aiService)
	ossHandler := handlers.NewOSSHandler(ossService)
	healthHandler := handlers.NewHealthHandler()
	crudHandler := handlers.NewCrudHandler(crudService)
	testHandler := handlers.NewTestHandler()

	router := setupRouter(cfg, authService, userService, userHandler, adminHandler, aiHandler, ossHandler, healthHandler, crudHandler, testHandler)

	logrus.Infof("服务器启动，端口: %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("服务器启动失败:", err)
	}
}

func setupRouter(cfg *config.Config, authService *auth.AuthService, userService *services.UserService, userHandler *handlers.UserHandler, adminHandler *handlers.AdminHandler, aiHandler *handlers.AIHandler, ossHandler *handlers.OSSHandler, healthHandler *handlers.HealthHandler, crudHandler *handlers.CrudHandler, testHandler *handlers.TestHandler) *gin.Engine {
	if cfg.IsProd {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()

	// 注意，gin对于 /crud 如果找不到，会尝试使用 /crud/ 来处理
	// 但是 gin 会调用 c.Redirect 来处理，而 c.Redirect 会快速 Abort，所有中间件都不会处理
	// 如果前端重定向基本必定跨域，所以没必要支持
	r.RedirectTrailingSlash = false // 禁用尾部斜杠自动重定向
	r.HandleMethodNotAllowed = true // 处理 405 错误

	r.Use(middleware.Logger())
	r.Use(middleware.Recovery())
	r.Use(middleware.CORS(cfg.IsDev))

	r.Use(middleware.RateLimitLow()) // 全局 Low 限流

	r.GET("/health", healthHandler.Health)
	r.GET("/ready", healthHandler.Ready)
	r.GET("/live", healthHandler.Live)

	// Swagger文档路由 (仅在开发环境)
	if !cfg.IsProd {
		r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	api := r.Group("/")
	{
		users := api.Group("/users")
		{
			// 公开接口
			users.POST("/register", userHandler.Register)
			users.POST("/login", userHandler.Login)

			// 用户自己的接口
			users.POST("/logout", middleware.AuthRequired(authService), userHandler.Logout)
			users.GET("/profile", middleware.AuthRequired(authService), userHandler.GetProfile)
			users.PUT("/profile", middleware.AuthRequired(authService), userHandler.UpdateProfile)
			users.POST("/change-password", middleware.AuthRequired(authService), userHandler.ChangePassword)
		}

		// 很多 openai 都是带有 v1 前缀的，模拟一下
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

		crud := api.Group("/crud")
		{
			crud.POST("", crudHandler.Create)       // 创建记录
			crud.GET("/:id", crudHandler.GetByID)   // 根据ID获取记录
			crud.GET("", crudHandler.GetList)       // 获取列表（支持分页）
			crud.PUT("/:id", crudHandler.Update)    // 更新记录
			crud.DELETE("/:id", crudHandler.Delete) // 删除记录
		}

		// 管理员接口
		admin := api.Group("/admin")
		admin.Use(middleware.AdminRequired(authService, userService))
		{
			// 系统管理
			admin.GET("/status", adminHandler.GetSystemStatus) // 获取系统状态

			// 用户管理
			adminUsers := admin.Group("/users")
			{
				adminUsers.GET("", userHandler.GetUsers)                               // 获取用户列表
				adminUsers.GET("/:id", userHandler.GetUserByID)                        // 根据ID获取用户
				adminUsers.DELETE("/:id", userHandler.DeleteUser)                      // 删除用户
				adminUsers.POST("/:id/activate", userHandler.ActivateUser)             // 激活用户
				adminUsers.POST("/:id/deactivate", userHandler.DeactivateUser)         // 停用用户
				adminUsers.POST("/:id/reset-password", adminHandler.ResetUserPassword) // 重置用户密码
			}
		}

		// 测试接口 - 用于测试各种错误码和响应
		test := api.Group("/test")
		{
			// 错误测试分组 - 所有测试接口都放在这里
			err := test.Group("/err")
			{
				err.GET("", testHandler.TestErrors)                       // 测试各种错误码
				err.POST("", testHandler.TestPostErrors)                  // 测试POST请求错误
				err.GET("/param/:id", testHandler.TestParamErrors)        // 测试路径参数错误
				err.GET("/code/:code", testHandler.TestSpecificError)     // 测试特定错误码
				err.GET("/network/:type", testHandler.TestNetworkError)   // 测试网络错误
				err.GET("/business/:type", testHandler.TestBusinessError) // 测试业务错误
			}
		}
	}

	r.NoMethod(func(c *gin.Context) {
		response.MethodNotAllowed(c, "该路径不支持 "+c.Request.Method+" 方法")
	})

	r.NoRoute(func(c *gin.Context) {
		response.Error(c, http.StatusNotFound, "路由未找到")
	})

	return r
}
