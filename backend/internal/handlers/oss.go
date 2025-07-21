package handlers

import (
	"ai-models-backend/internal/models"
	"ai-models-backend/internal/services"
	"ai-models-backend/pkg/response"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

const (
	maxFileSize = 10 * 1024 * 1024 // 10MB
	errorCode   = 101
)

/* OSS处理器，处理文件上传相关的HTTP请求 */
type OSSHandler struct {
	ossService *services.OSSService
}

/* 创建新的OSS处理器 */
func NewOSSHandler(ossService *services.OSSService) *OSSHandler {
	return &OSSHandler{
		ossService: ossService,
	}
}

/* 获取STS临时凭证 */
func (h *OSSHandler) GetSTSCredentials(c *gin.Context) {
	// 验证OSS配置
	if err := h.ossService.ValidateConfig(); err != nil {
		response.Error(c, http.StatusInternalServerError, fmt.Sprintf("OSS配置错误: %s", err.Error()))
		return
	}

	credentials, err := h.ossService.GetSTSCredentials()
	if err != nil {
		logrus.WithError(err).Error("获取STS凭证失败")
		response.Error(c, http.StatusInternalServerError, fmt.Sprintf("获取STS凭证失败: %s", err.Error()))
		return
	}

	response.Success(c, models.STSResponse{
		Credentials: *credentials,
	})
}

/* 生成上传签名 */
func (h *OSSHandler) SignToUpload(c *gin.Context) {
	var req models.SignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "请求参数无效")
		return
	}

	if req.ObjectKey == "" {
		response.Error(c, http.StatusBadRequest, "objectKey不能为空")
		return
	}

	fileType := req.FileType
	if fileType == "" {
		fileType = "application/octet-stream"
	}

	signedURL, err := h.ossService.SignToUpload(req.ObjectKey, fileType)
	if err != nil {
		logrus.WithError(err).Error("生成上传签名失败")
		response.Error(c, http.StatusInternalServerError, fmt.Sprintf("生成上传签名失败: %s", err.Error()))
		return
	}

	response.Success(c, models.SignResponse{
		SignedURL: signedURL,
		ObjectKey: req.ObjectKey,
	})
}

/* 生成获取签名 */
func (h *OSSHandler) SignToFetch(c *gin.Context) {
	var req models.SignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "请求参数无效")
		return
	}

	if req.ObjectKey == "" {
		response.Error(c, http.StatusBadRequest, "objectKey不能为空")
		return
	}

	signedURL, err := h.ossService.SignToFetch(req.ObjectKey)
	if err != nil {
		logrus.WithError(err).Error("生成获取签名失败")
		response.Error(c, http.StatusInternalServerError, fmt.Sprintf("生成获取签名失败: %s", err.Error()))
		return
	}

	response.Success(c, models.SignResponse{
		SignedURL: signedURL,
		ObjectKey: req.ObjectKey,
	})
}

/* 生成哈希文件名 */
func (h *OSSHandler) HashifyName(c *gin.Context) {
	var req models.HashifyNameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "请求参数无效")
		return
	}

	if req.FileName == "" {
		response.Error(c, http.StatusBadRequest, "文件名不能为空")
		return
	}

	hashifyName := h.ossService.HashifyName(req.FileName)
	response.Success(c, models.HashifyNameResponse{
		HashifyName: hashifyName,
	})
}

/* 直接上传文件 */
func (h *OSSHandler) UploadFile(c *gin.Context) {
	// 解析multipart表单
	err := c.Request.ParseMultipartForm(maxFileSize)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "解析文件失败")
		return
	}

	// 获取上传的文件
	fileHeader, err := c.FormFile("file")
	if err != nil {
		response.Error(c, http.StatusBadRequest, "文件不能为空")
		return
	}

	// 验证文件
	if err := h.ossService.ValidateFile(fileHeader); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	// 获取可选参数
	var uploadReq models.FileUploadRequest
	if err := c.ShouldBind(&uploadReq); err != nil {
		// 忽略绑定错误，使用默认值
		logrus.WithError(err).Debug("绑定上传参数失败，使用默认值")
	}

	// 确定最终文件名
	finalFileName := uploadReq.FileName
	if finalFileName == "" {
		finalFileName = fileHeader.Filename
	}

	// 生成哈希化文件名
	hashifyName := h.ossService.HashifyName(finalFileName)

	// 生成最终的objectKey
	objectKey := hashifyName
	if uploadReq.Prefix != "" {
		// 确保prefix以/结尾
		normalizedPrefix := strings.TrimSuffix(uploadReq.Prefix, "/") + "/"
		objectKey = normalizedPrefix + hashifyName
	}

	// 打开文件
	file, err := fileHeader.Open()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "打开文件失败")
		return
	}
	defer file.Close()

	// 上传文件到OSS
	contentType := fileHeader.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	if err := h.ossService.UploadFile(file, objectKey, contentType); err != nil {
		logrus.WithError(err).Error("上传文件失败")
		response.Error(c, http.StatusInternalServerError, fmt.Sprintf("上传失败: %s", err.Error()))
		return
	}

	logrus.WithFields(logrus.Fields{
		"objectKey":   objectKey,
		"size":        fileHeader.Size,
		"contentType": contentType,
		"clientIP":    c.ClientIP(),
	}).Info("[OSS] 代理模式上传成功")

	// 根据noPreview参数决定是否获取URL
	var url string
	if uploadReq.NoPreview != "true" {
		fileURL, urlErr := h.ossService.GetFileURL(objectKey)
		if urlErr != nil {
			logrus.WithError(urlErr).Warn("生成文件URL失败")
		} else {
			url = fileURL
		}
	}

	response.Success(c, models.FileUploadResponse{
		ObjectKey:  objectKey,
		URL:        url,
		Size:       fileHeader.Size,
		Type:       contentType,
		UploadTime: time.Now().Format(time.RFC3339),
	})
}

/* 删除文件 */
func (h *OSSHandler) DeleteFile(c *gin.Context) {
	var req models.DeleteFileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "请求参数无效")
		return
	}

	if req.ObjectKey == "" {
		response.Error(c, http.StatusBadRequest, "objectKey不能为空")
		return
	}

	if err := h.ossService.DeleteFile(req.ObjectKey); err != nil {
		logrus.WithError(err).Error("删除文件失败")
		response.Error(c, http.StatusInternalServerError, fmt.Sprintf("删除失败: %s", err.Error()))
		return
	}

	response.Success(c, gin.H{"message": "删除成功"})
}

/* 获取文件URL */
func (h *OSSHandler) GetFileURL(c *gin.Context) {
	var req models.GetURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "请求参数无效")
		return
	}

	if req.ObjectKey == "" {
		response.Error(c, http.StatusBadRequest, "objectKey不能为空")
		return
	}

	url, err := h.ossService.GetFileURL(req.ObjectKey)
	if err != nil {
		logrus.WithError(err).Error("获取文件URL失败")
		response.Error(c, http.StatusInternalServerError, fmt.Sprintf("获取URL失败: %s", err.Error()))
		return
	}

	response.Success(c, models.GetURLResponse{
		URL:       url,
		ObjectKey: req.ObjectKey,
	})
}

/* 获取文件列表 */
func (h *OSSHandler) GetFileList(c *gin.Context) {
	var query models.FileListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.Error(c, http.StatusBadRequest, "查询参数无效")
		return
	}

	// 处理maxKeys参数
	maxKeys := query.MaxKeys
	if maxKeys <= 0 {
		maxKeysStr := c.Query("maxKeys")
		maxKeys = services.ParseMaxKeys(maxKeysStr)
	}

	result, err := h.ossService.GetFileList(query.Prefix, maxKeys)
	if err != nil {
		logrus.WithError(err).Error("获取文件列表失败")
		response.Error(c, http.StatusInternalServerError, fmt.Sprintf("获取文件列表失败: %s", err.Error()))
		return
	}

	response.Success(c, result)
}

/* 健康检查，验证OSS连接 */
func (h *OSSHandler) HealthCheck(c *gin.Context) {
	if err := h.ossService.ValidateConfig(); err != nil {
		response.Error(c, http.StatusServiceUnavailable, fmt.Sprintf("OSS配置错误: %s", err.Error()))
		return
	}

	response.Success(c, gin.H{
		"status":    "ok",
		"service":   "oss",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

/* 获取OSS配置信息（脱敏） */
func (h *OSSHandler) GetConfigInfo(c *gin.Context) {
	// 返回脱敏的配置信息供前端调试使用
	response.Success(c, gin.H{
		"bucket":      h.ossService.ValidateConfig() == nil, // 是否配置了bucket
		"region":      h.ossService.ValidateConfig() == nil, // 是否配置了region
		"credentials": h.ossService.ValidateConfig() == nil, // 是否配置了凭证
		"timestamp":   time.Now().Format(time.RFC3339),
	})
}

/* 中间件：验证文件大小 */
func FileSizeMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// 检查Content-Length头
		if contentLength := c.Request.Header.Get("Content-Length"); contentLength != "" {
			if length, err := strconv.ParseInt(contentLength, 10, 64); err == nil {
				if length > maxFileSize {
					response.Error(c, http.StatusRequestEntityTooLarge, 
						fmt.Sprintf("文件大小超出限制，最大允许%dMB", maxFileSize/(1024*1024)))
					c.Abort()
					return
				}
			}
		}
		c.Next()
	})
}