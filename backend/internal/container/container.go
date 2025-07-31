package container

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/database"
	"ai-models-backend/internal/handlers"
	"ai-models-backend/internal/services"
	"ai-models-backend/internal/services/ai"
	"ai-models-backend/internal/services/auth"
)

/**
 * 依赖注入容器，统一管理所有服务和处理器
 * 用于解决 setupRouter 函数参数过多的问题
 */
type Container struct {
	// 核心配置
	Config *config.Config

	// 服务层
	AuthService     *auth.AuthService
	UserService     *services.UserService
	AIService       *ai.AIService
	OSSService      *services.OSSService
	CrudService     *services.CrudService
	TodoService     *services.TodoService
	FeedService     *services.FeedService
	FeedSyncManager *services.FeedSyncManager

	// 处理器层
	UserHandler   *handlers.UserHandler
	AdminHandler  *handlers.AdminHandler
	AIHandler     *handlers.AIHandler
	OSSHandler    *handlers.OSSHandler
	HealthHandler *handlers.HealthHandler
	CrudHandler   *handlers.CrudHandler
	TodoHandler   *handlers.TodoHandler
	TestHandler   *handlers.TestHandler
	FeedHandler   *handlers.FeedHandler
}

/* 创建新的容器实例并初始化所有依赖 */
func New(cfg *config.Config) *Container {
	// 初始化服务层
	userService := services.NewUserService(cfg)
	authService := auth.NewAuthService(cfg)
	aiService := ai.NewAIService(cfg)
	ossService := services.NewOSSService(cfg)
	crudService := services.NewCrudService()
	todoService := services.NewTodoService()
	feedService := services.NewFeedService(database.GetDB(), userService)
	feedSyncManager := services.NewFeedSyncManager(feedService, userService)

	// 初始化处理器层
	userHandler := handlers.NewUserHandler(userService, authService)
	adminHandler := handlers.NewAdminHandler(userService, authService)
	aiHandler := handlers.NewAIHandler(aiService)
	ossHandler := handlers.NewOSSHandler(ossService)
	healthHandler := handlers.NewHealthHandler()
	crudHandler := handlers.NewCrudHandler(crudService)
	todoHandler := handlers.NewTodoHandler(todoService)
	testHandler := handlers.NewTestHandler()
	feedHandler := handlers.NewFeedHandler(feedService)

	return &Container{
		Config:          cfg,
		AuthService:     authService,
		UserService:     userService,
		AIService:       aiService,
		OSSService:      ossService,
		CrudService:     crudService,
		TodoService:     todoService,
		FeedService:     feedService,
		FeedSyncManager: feedSyncManager,
		UserHandler:     userHandler,
		AdminHandler:    adminHandler,
		AIHandler:       aiHandler,
		OSSHandler:      ossHandler,
		HealthHandler:   healthHandler,
		CrudHandler:     crudHandler,
		TodoHandler:     todoHandler,
		TestHandler:     testHandler,
		FeedHandler:     feedHandler,
	}
}

/* 初始化应用启动时需要执行的操作 */
func (c *Container) Initialize() error {
	// 创建默认管理员用户
	if err := c.AuthService.CreateDefaultAdmin(); err != nil {
		return err
	}

	// 启动Feed同步任务
	if err := c.FeedSyncManager.StartSyncTasks(); err != nil {
		return err
	}

	return nil
}

/* 关闭应用时的清理操作 */
func (c *Container) Shutdown() {
	// 停止Feed同步任务
	c.FeedSyncManager.StopSyncTasks()
}
