package main

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/handlers"
	"ai-models-backend/internal/middleware"
	"ai-models-backend/internal/services"
	"ai-models-backend/pkg/response"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		logrus.Warn("No .env file found, using system environment variables")
	}

	// Initialize configuration
	cfg := config.New()

	// Initialize services
	userService := services.NewUserService()
	aiService := services.NewAIService()

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userService)
	aiHandler := handlers.NewAIHandler(aiService)
	healthHandler := handlers.NewHealthHandler()

	// Setup router
	router := setupRouter(cfg, userHandler, aiHandler, healthHandler)

	// Start server
	logrus.Infof("Starting server on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func setupRouter(cfg *config.Config, userHandler *handlers.UserHandler, aiHandler *handlers.AIHandler, healthHandler *handlers.HealthHandler) *gin.Engine {
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()

	// Global middleware
	r.Use(middleware.Logger())
	r.Use(middleware.Recovery())
	r.Use(middleware.CORS())

	// Health check endpoint
	r.GET("/health", healthHandler.Health)

	// API routes
	api := r.Group("/api/v1")
	{
		// User routes
		users := api.Group("/users")
		{
			users.POST("/register", userHandler.Register)
			users.POST("/login", userHandler.Login)
			users.GET("/profile", middleware.AuthRequired(), userHandler.GetProfile)
			users.PUT("/profile", middleware.AuthRequired(), userHandler.UpdateProfile)
		}

		// AI routes
		ai := api.Group("/ai")
		ai.Use(middleware.AuthRequired())
		{
			ai.POST("/chat", aiHandler.Chat)
			ai.POST("/generate", aiHandler.Generate)
			ai.GET("/models", aiHandler.GetModels)
		}
	}

	// 404 handler
	r.NoRoute(func(c *gin.Context) {
		response.Error(c, http.StatusNotFound, "Route not found")
	})

	return r
}