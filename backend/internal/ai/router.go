package ai

import (
	"github.com/go-chi/chi/v5"
)

// RegisterRoutes 注册AI相关的路由
func RegisterRoutes(r chi.Router, h *Handler) {
	r.Route("/v1", func(r chi.Router) {
		// Chat相关接口
		r.Post("/chat/completions", h.HandleChat)

		// 图片生成相关接口
		r.Post("/images/generations", h.HandleGenerateImages)

		// 视频生成相关接口
		r.Post("/videos/generations", h.HandleGenerateVideos)
		r.Get("/videos/status", h.HandleGetVideoStatus)
	})
}
