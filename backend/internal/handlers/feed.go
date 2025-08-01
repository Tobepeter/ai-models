package handlers

import (
	"net/http"

	"ai-models-backend/internal/models"
	"ai-models-backend/internal/services"
	"ai-models-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// FeedHandler 信息流处理器
type FeedHandler struct {
	BaseHandler
	feedService *services.FeedService
}

// NewFeedHandler 创建信息流处理器
func NewFeedHandler(feedService *services.FeedService) *FeedHandler {
	return &FeedHandler{
		feedService: feedService,
	}
}

// @Summary 获取信息流帖子列表
// @Description 支持多种排序方式和cursor分页
// @ID getFeedPosts
// @Tags Feed
// @Param params query models.FeedQueryParams true "查询参数"
// @Success 200 {object} response.Response{data=models.FeedPostResponse}
// @Router /api/feed/posts [get]
func (h *FeedHandler) GetFeedPosts(c *gin.Context) {
	var params models.FeedQueryParams
	if err := c.ShouldBindQuery(&params); err != nil {
		response.Error(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	// 设置默认值
	if params.Sort == "" {
		params.Sort = "time"
	}
	if params.Limit == 0 {
		params.Limit = 20
	}

	posts, nextCursor, hasMore, err := h.feedService.GetFeedPosts(params)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取信息流失败")
		return
	}

	response.Success(c, models.FeedPostResponse{
		Posts:      posts,
		NextCursor: nextCursor,
		HasMore:    hasMore,
	})
}

// @Summary 创建信息流帖子
// @Description 创建新的信息流帖子，需要登录
// @ID createFeedPost
// @Tags Feed
// @Param request body models.CreateFeedPostRequest true "帖子内容"
// @Success 200 {object} response.Response{data=models.FeedPost}
// @Router /api/feed/posts [post]
func (h *FeedHandler) CreateFeedPost(c *gin.Context) {
	userID, ok := h.GetUserID(c)
	if !ok {
		return
	}

	var req models.CreateFeedPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	// 验证内容不能为空（内容或图片至少有一个）
	if req.Content == "" && req.ImageURL == "" {
		response.Error(c, http.StatusBadRequest, "内容和图片不能同时为空")
		return
	}

	post, err := h.feedService.CreateFeedPost(userID, req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "创建帖子失败")
		return
	}

	response.Success(c, post)
}

// @Summary 设置帖子点赞状态
// @Description 设置帖子点赞或取消点赞状态，需要登录
// @ID setFeedPostLike
// @Tags Feed
// @Param post_id path string true "帖子ID"
// @Param request body models.SetFeedPostLikeRequest true "点赞状态"
// @Success 200 {object} response.Response{data=models.LikeResult}
// @Router /api/feed/posts/{post_id}/like [post]
func (h *FeedHandler) SetLikePost(c *gin.Context) {
	userID, ok := h.GetUserID(c)
	if !ok {
		return
	}

	postID := c.Param("post_id")
	if postID == "" {
		response.Error(c, http.StatusBadRequest, "帖子ID不能为空")
		return
	}

	var req models.SetFeedPostLikeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	result, err := h.feedService.SetFeedPostLike(userID, postID, req.IsLike)
	if err != nil {
		if err.Error() == "post not found" {
			response.Error(c, http.StatusNotFound, "帖子不存在")
			return
		}
		response.Error(c, http.StatusInternalServerError, "操作失败")
		return
	}

	response.Success(c, result)
}

// @Summary 获取帖子评论列表
// @Description 获取指定帖子的评论列表，支持cursor分页
// @ID getFeedComments
// @Tags Feed
// @Param post_id path string true "帖子ID"
// @Param params query models.CommentQueryParams true "查询参数"
// @Success 200 {object} response.Response{data=models.FeedCommentResponse}
// @Router /api/feed/posts/{post_id}/comments [get]
func (h *FeedHandler) GetFeedComments(c *gin.Context) {
	postID := c.Param("post_id")
	if postID == "" {
		response.Error(c, http.StatusBadRequest, "帖子ID不能为空")
		return
	}

	var params models.CommentQueryParams
	if err := c.ShouldBindQuery(&params); err != nil {
		response.Error(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	// 设置默认值和帖子ID
	params.PostID = postID
	if params.Limit == 0 {
		params.Limit = 20
	}

	comments, nextCursor, hasMore, total, err := h.feedService.GetFeedComments(params)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "获取评论失败")
		return
	}

	response.Success(c, models.FeedCommentResponse{
		Comments:   comments,
		NextCursor: nextCursor,
		HasMore:    hasMore,
		Total:      total,
	})
}

// @Summary 创建帖子评论
// @Description 为指定帖子创建评论，需要登录
// @ID createFeedComment
// @Tags Feed
// @Param post_id path string true "帖子ID"
// @Param request body models.CreateFeedCommentRequest true "评论内容"
// @Success 200 {object} response.Response{data=models.FeedComment}
// @Router /api/feed/posts/{post_id}/comments [post]
func (h *FeedHandler) CreateFeedComment(c *gin.Context) {
	userID, ok := h.GetUserID(c)
	if !ok {
		return
	}

	postID := c.Param("post_id")
	if postID == "" {
		response.Error(c, http.StatusBadRequest, "帖子ID不能为空")
		return
	}

	var req models.CreateFeedCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	comment, err := h.feedService.CreateFeedComment(userID, postID, req)
	if err != nil {
		if err.Error() == "post not found" {
			response.Error(c, http.StatusNotFound, "帖子不存在")
			return
		}
		response.Error(c, http.StatusInternalServerError, "创建评论失败")
		return
	}

	response.Success(c, comment)
}

// @Summary 设置评论点赞状态
// @Description 设置评论点赞或取消点赞状态，需要登录
// @ID setFeedCommentLike
// @Tags Feed
// @Param comment_id path string true "评论ID"
// @Param request body models.SetFeedCommentLikeRequest true "点赞状态"
// @Success 200 {object} response.Response{data=models.LikeResult}
// @Router /api/feed/comments/{comment_id}/like [post]
func (h *FeedHandler) SetCommentLike(c *gin.Context) {
	userID, ok := h.GetUserID(c)
	if !ok {
		return
	}

	commentID := c.Param("comment_id")
	if commentID == "" {
		response.Error(c, http.StatusBadRequest, "评论ID不能为空")
		return
	}

	var req models.SetFeedCommentLikeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	result, err := h.feedService.SetFeedCommentLike(userID, commentID, req.IsLike)
	if err != nil {
		if err.Error() == "comment not found" {
			response.Error(c, http.StatusNotFound, "评论不存在")
			return
		}
		response.Error(c, http.StatusInternalServerError, "操作失败")
		return
	}

	response.Success(c, result)
}

// @Summary 获取帖子详情
// @Description 获取指定帖子的详细信息
// @ID getFeedPostDetail
// @Tags Feed
// @Param post_id path string true "帖子ID"
// @Success 200 {object} response.Response{data=models.FeedPost}
// @Router /api/feed/posts/{post_id} [get]
func (h *FeedHandler) GetFeedPostDetail(c *gin.Context) {
	postID := c.Param("post_id")
	if postID == "" {
		response.Error(c, http.StatusBadRequest, "帖子ID不能为空")
		return
	}

	post, err := h.feedService.GetFeedPostByID(postID)
	if err != nil {
		if err.Error() == "post not found" {
			response.Error(c, http.StatusNotFound, "帖子不存在")
			return
		}
		response.Error(c, http.StatusInternalServerError, "获取帖子详情失败")
		return
	}

	response.Success(c, post)
}
