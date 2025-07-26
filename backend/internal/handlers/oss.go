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

type OSSHandler struct {
	ossService *services.OSSService
}

func NewOSSHandler(ossService *services.OSSService) *OSSHandler {
	return &OSSHandler{
		ossService: ossService,
	}
}

// @Summary STS临时凭证
// @Description 获取STS临时凭证，用于上传文件，或者浏览
// @ID getStsCredentials
// @Tags OSS
// @Success 200 {object} response.Response{data=models.STSResponse}
// @Router /oss/sts [get]
func (h *OSSHandler) GetSTSCredentials(c *gin.Context) {
	// 验证OSS配置
	if err := h.ossService.ValidateCfg(); err != nil {
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

// @Summary 生成上传签名
// @Description 生成上传签名，用于上传文件
// @ID signToUpload
// @Tags OSS
// @Param request body models.SignRequest true "签名请求"
// @Success 200 {object} response.Response{data=models.SignResponse}
// @Router /oss/sign-to-upload [post]
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

// @Summary 生成获取签名
// @Description 生成获取签名，用于下载文件
// @ID signToFetch
// @Tags OSS
// @Param request body models.SignRequest true "签名请求"
// @Success 200 {object} response.Response{data=models.SignResponse}
// @Router /oss/sign-to-fetch [post]
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

// @Summary 生成哈希文件名
// @Description 生成哈希文件名，防止重名
// @ID hashifyName
// @Tags OSS
// @Param request body models.HashifyNameRequest true "文件名请求"
// @Success 200 {object} response.Response{data=models.HashifyNameResponse}
// @Router /oss/hashify [post]
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

// @Summary 直接上传文件
// @Description 直接上传文件到OSS
// @ID uploadFile
// @Tags OSS
// @Accept multipart/form-data
// @Param file formData file true "文件"
// @Param fileName formData string false "文件名"
// @Param prefix formData string false "前缀"
// @Param noPreview formData string false "不预览"
// @Success 200 {object} response.Response{data=models.FileUploadResponse}
// @Router /oss/upload [post]
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

// @Summary 删除
// @Description 删除OSS文件
// @ID delete
// @Tags OSS
// @Param request body models.DeleteFileRequest true "删除请求"
// @Success 200 {object} response.Response{data=map[string]any}
// @Router /oss/delete [delete]
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

// @Summary 获取文件URL
// @ID getFileURL
// @Tags OSS
// @Param request body models.GetURLRequest true "URL请求"
// @Success 200 {object} response.Response{data=models.GetURLResponse}
// @Router /oss/url [post]
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

// @Summary 获取文件列表
// @Description 获取OSS文件列表
// @ID getFileList
// @Tags OSS
// @Param prefix query string false "前缀"
// @Param maxKeys query int false "最大数量"
// @Success 200 {object} response.Response{data=models.FileListResponse}
// @Router /oss/files [get]
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
