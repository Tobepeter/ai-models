package ai

import (
	"encoding/json"
	"net/http"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{
		service: service,
	}
}

// HandleChat 处理文本生成请求
func (h *Handler) HandleChat(w http.ResponseWriter, r *http.Request) {
	platform := Platform(r.URL.Query().Get("platform"))
	if platform == "" {
		platform = PlatformOpenRouter // 默认使用OpenRouter
	}

	var req TextRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.Stream {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")

		if err := h.service.ChatStream(r.Context(), platform, &req, w); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		return
	}

	resp, err := h.service.Chat(r.Context(), platform, &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// HandleGenerateImages 处理图片生成请求
func (h *Handler) HandleGenerateImages(w http.ResponseWriter, r *http.Request) {
	platform := Platform(r.URL.Query().Get("platform"))
	if platform == "" {
		platform = PlatformOpenRouter
	}

	var req ImageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	resp, err := h.service.GenerateImages(r.Context(), platform, &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// HandleGenerateVideos 处理视频生成请求
func (h *Handler) HandleGenerateVideos(w http.ResponseWriter, r *http.Request) {
	platform := Platform(r.URL.Query().Get("platform"))
	if platform == "" {
		platform = PlatformOpenRouter
	}

	var req VideoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	resp, err := h.service.GenerateVideos(r.Context(), platform, &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// HandleGetVideoStatus 处理获取视频任务状态请求
func (h *Handler) HandleGetVideoStatus(w http.ResponseWriter, r *http.Request) {
	platform := Platform(r.URL.Query().Get("platform"))
	if platform == "" {
		platform = PlatformOpenRouter
	}

	taskID := r.URL.Query().Get("task_id")
	if taskID == "" {
		http.Error(w, "task_id is required", http.StatusBadRequest)
		return
	}

	resp, err := h.service.GetVideoStatus(r.Context(), platform, taskID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
