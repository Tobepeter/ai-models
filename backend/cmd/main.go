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
	"ai-models-backend/internal/container"
	"ai-models-backend/internal/database"
	"ai-models-backend/internal/handlers"
	"ai-models-backend/internal/middleware"
	"ai-models-backend/pkg/response"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "ai-models-backend/docs" // 导入生成的docs包
)

func main() {
	// 设置 logrus 为 JSON 格式
	logrus.SetFormatter(&logrus.JSONFormatter{})

	cfg := config.New()

	// 初始化数据库
	if err := database.Initialize(cfg); err != nil {
		log.Fatal("数据库初始化失败:", err)
	}
	defer database.Close()

	// 初始化Redis
	if err := database.InitializeRedis(cfg); err != nil {
		log.Fatal("Redis初始化失败:", err)
	}
	defer database.CloseRedis()

	// 创建依赖注入容器
	c := container.New(cfg)

	// 初始化应用
	if err := c.Initialize(); err != nil {
		logrus.Warn("应用初始化失败:", err)
	}

	router := setupRouter(c)

	logrus.Infof("服务器启动，端口: %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("服务器启动失败:", err)
	}
}

func setupRouter(c *container.Container) *gin.Engine {
	if c.Config.IsProd {
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
	r.Use(middleware.CORS(c.Config.IsDev))

	r.Use(middleware.RateLimitLow()) // 全局 Low 限流

	r.GET("/health", c.HealthHandler.Health)
	r.GET("/ready", c.HealthHandler.Ready)
	r.GET("/live", c.HealthHandler.Live)

	// 监控指标端点
	r.GET("/metrics/redis", c.MetricsHandler.RedisMetrics)

	// Swagger文档路由 (仅在开发环境)
	if !c.Config.IsProd {
		r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	api := r.Group("/")
	{
		users := api.Group("/users")
		{
			// 公开接口
			users.POST("/register", c.UserHandler.Register)
			users.POST("/login", c.UserHandler.Login)
			users.GET("/check-field", c.UserHandler.CheckUserField) // 检查字段是否存在

			// 用户自己的接口
			users.POST("/logout", middleware.AuthRequired(c.AuthService), c.UserHandler.Logout)
			users.GET("/profile", middleware.AuthRequired(c.AuthService), c.UserHandler.GetProfile)
			users.PUT("/profile", middleware.AuthRequired(c.AuthService), c.UserHandler.UpdateProfile)
			users.POST("/change-password", middleware.AuthRequired(c.AuthService), c.UserHandler.ChangePassword)
		}

		// 很多 openai 都是带有 v1 前缀的，模拟一下
		ai := api.Group("/ai/v1")
		ai.Use(middleware.RateLimitMid())
		{
			ai.POST("/chat/completions", c.AIHandler.OpenAIChatCompletion)
			ai.POST("/images/generations", c.AIHandler.GenerateImages)
		}

		oss := api.Group("/oss")
		{
			// 客户端签名模式 - 获取签名和凭证
			oss.POST("/sts", c.OSSHandler.GetSTSCredentials)
			oss.POST("/sign-to-upload", c.OSSHandler.SignToUpload)
			oss.POST("/sign-to-fetch", c.OSSHandler.SignToFetch)
			oss.POST("/hashify-name", c.OSSHandler.HashifyName)
			oss.GET("/files", c.OSSHandler.GetFileList)

			// 代理模式 - 后端全权代理操作
			oss.POST("/upload", handlers.FileSizeMiddleware(), c.OSSHandler.UploadFile)
			oss.POST("/delete", c.OSSHandler.DeleteFile)
			oss.POST("/get-url", c.OSSHandler.GetFileURL)
		}

		crud := api.Group("/crud")
		{
			crud.POST("", c.CrudHandler.Create)       // 创建记录
			crud.GET("/:id", c.CrudHandler.GetByID)   // 根据ID获取记录
			crud.GET("", c.CrudHandler.GetList)       // 获取列表（支持分页）
			crud.PUT("/:id", c.CrudHandler.Update)    // 更新记录
			crud.DELETE("/:id", c.CrudHandler.Delete) // 删除记录
		}

		todos := api.Group("/todos")
		todos.Use(middleware.AuthRequired(c.AuthService)) // 需要认证
		{
			todos.POST("", c.TodoHandler.CreateTodo)                     // 创建TODO
			todos.GET("/stats", c.TodoHandler.GetStats)                  // 获取TODO统计信息
			todos.PUT("/positions", c.TodoHandler.UpdatePositions)       // 批量更新位置（拖拽排序）
			todos.POST("/rebalance", c.TodoHandler.RebalancePositions)   // 重新平衡位置
			todos.GET("/:id", c.TodoHandler.GetTodoByID)                 // 根据ID获取TODO
			todos.GET("", c.TodoHandler.GetTodoList)                     // 获取TODO列表（按位置排序）
			todos.PUT("/:id", c.TodoHandler.UpdateTodo)                  // 更新TODO
			todos.PATCH("/:id/toggle", c.TodoHandler.ToggleTodoComplete) // 切换TODO完成状态
			todos.DELETE("/:id", c.TodoHandler.DeleteTodo)               // 删除TODO
		}

		// 管理员接口
		admin := api.Group("/admin")
		admin.Use(middleware.AdminRequired(c.AuthService, c.UserService))
		{
			// 系统管理
			admin.GET("/status", c.AdminHandler.GetSystemStatus) // 获取系统状态

			// 用户管理
			adminUsers := admin.Group("/users")
			{
				adminUsers.GET("", c.UserHandler.GetUsers)                               // 获取用户列表
				adminUsers.GET("/:id", c.UserHandler.GetUserByID)                        // 根据ID获取用户
				adminUsers.DELETE("/:id", c.UserHandler.DeleteUser)                      // 删除用户
				adminUsers.POST("/:id/activate", c.UserHandler.ActivateUser)             // 激活用户
				adminUsers.POST("/:id/deactivate", c.UserHandler.DeactivateUser)         // 停用用户
				adminUsers.POST("/:id/reset-password", c.AdminHandler.ResetUserPassword) // 重置用户密码
			}
		}

		// Feed 信息流接口
		feed := api.Group("/feed")
		{
			// 公开接口
			feed.GET("/posts", c.FeedHandler.GetFeedPosts)                      // 获取信息流帖子列表
			feed.GET("/posts/:post_id", c.FeedHandler.GetFeedPostDetail)        // 获取帖子详情
			feed.GET("/posts/:post_id/comments", c.FeedHandler.GetFeedComments) // 获取帖子评论列表

			// 需要认证的接口
			feedAuth := feed.Group("")
			feedAuth.Use(middleware.AuthRequired(c.AuthService))
			{
				feedAuth.POST("/posts", c.FeedHandler.CreateFeedPost)                      // 创建信息流帖子
				feedAuth.POST("/posts/:post_id/like", c.FeedHandler.SetLikePost)           // 设置帖子点赞状态
				feedAuth.POST("/posts/:post_id/comments", c.FeedHandler.CreateFeedComment) // 创建帖子评论
				feedAuth.POST("/comments/:comment_id/like", c.FeedHandler.SetCommentLike)  // 设置评论点赞状态
			}
		}

		// 测试接口 - 用于测试各种错误码和响应
		test := api.Group("/test")
		{
			// 错误测试分组 - 所有测试接口都放在这里
			err := test.Group("/err")
			{
				err.GET("", c.TestHandler.TestErrors)                       // 测试各种错误码
				err.POST("", c.TestHandler.TestPostErrors)                  // 测试POST请求错误
				err.GET("/param/:id", c.TestHandler.TestParamErrors)        // 测试路径参数错误
				err.GET("/code/:code", c.TestHandler.TestSpecificError)     // 测试特定错误码
				err.GET("/network/:type", c.TestHandler.TestNetworkError)   // 测试网络错误
				err.GET("/business/:type", c.TestHandler.TestBusinessError) // 测试业务错误
			}

			// 测试JSON字段命名
			test.GET("/str-case", func(c *gin.Context) {
				type TestStruct struct {
					UserID uint64 `json:"user_id"`
				}
				data := TestStruct{UserID: 123}
				c.JSON(http.StatusOK, data)
			})
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
