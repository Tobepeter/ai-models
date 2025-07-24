package services

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/models"
	"bytes"
	"context"
	"crypto/rand"
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	openapi "github.com/alibabacloud-go/darabonba-openapi/v2/client"
	sts20150401 "github.com/alibabacloud-go/sts-20150401/v2/client"
	"github.com/alibabacloud-go/tea/tea"
	"github.com/aliyun/alibabacloud-oss-go-sdk-v2/oss"
	"github.com/aliyun/alibabacloud-oss-go-sdk-v2/oss/credentials"
	"github.com/sirupsen/logrus"
)

type OSSService struct {
	client *oss.Client
	config *config.Config
}

func NewOSSService(cfg *config.Config) *OSSService {
	provider := credentials.NewStaticCredentialsProvider(cfg.OSSAccessKeyID, cfg.OSSAccessKeySecret)

	region := cutRegionPrefix(cfg.OSSRegion)

	client := oss.NewClient(&oss.Config{
		Region:              &region,
		CredentialsProvider: provider,
	})

	logrus.Info("OSS服务初始化完成")
	return &OSSService{
		client: client,
		config: cfg,
	}
}

// GetSTSCredentials 获取STS临时凭证
func (s *OSSService) GetSTSCredentials() (*models.STSCredentials, error) {
	// 检查必要的配置
	if s.config.OSSRoleArn == "" {
		return nil, fmt.Errorf("OSS_ROLE_ARN 未配置")
	}

	// 修正region格式：STS客户端也需要去掉oss-前缀
	region, found := strings.CutPrefix(s.config.OSSRegion, "oss-")
	if !found {
		region = s.config.OSSRegion
	}

	// 创建STS客户端配置
	config := &openapi.Config{
		AccessKeyId:     tea.String(s.config.OSSAccessKeyID),
		AccessKeySecret: tea.String(s.config.OSSAccessKeySecret),
		RegionId:        tea.String(region),
		// Endpoint:        tea.String("sts.cn-shenzhen.aliyuncs.com"), // 可选
	}

	// 创建STS客户端
	client, err := sts20150401.NewClient(config)
	if err != nil {
		return nil, fmt.Errorf("创建STS客户端失败: %w", err)
	}

	// 创建AssumeRole请求
	request := &sts20150401.AssumeRoleRequest{
		RoleArn:         tea.String(s.config.OSSRoleArn),
		RoleSessionName: tea.String("oss-backend-session"),
		DurationSeconds: tea.Int64(3600), // 1小时有效期
	}

	// 调用AssumeRole获取临时凭证
	response, err := client.AssumeRole(request)
	if err != nil {
		return nil, fmt.Errorf("获取STS临时凭证失败: %w", err)
	}

	// 检查响应
	if response.Body == nil || response.Body.Credentials == nil {
		return nil, fmt.Errorf("STS响应无效")
	}

	credentials := response.Body.Credentials
	return &models.STSCredentials{
		AccessKeyID:     tea.StringValue(credentials.AccessKeyId),
		AccessKeySecret: tea.StringValue(credentials.AccessKeySecret),
		SecurityToken:   tea.StringValue(credentials.SecurityToken),
		Expiration:      tea.StringValue(credentials.Expiration),
	}, nil
}

// SignToUpload 生成上传签名URL
func (s *OSSService) SignToUpload(objectKey string, fileType string) (string, error) {
	if fileType == "" {
		fileType = "application/octet-stream"
	}

	request := &oss.PutObjectRequest{
		Bucket:      oss.Ptr(s.config.OSSBucket),
		Key:         oss.Ptr(objectKey),
		ContentType: oss.Ptr(fileType),
	}

	presignResult, err := s.client.Presign(context.TODO(), request, func(options *oss.PresignOptions) {
		options.Expiration = time.Now().Add(time.Hour) // 1小时过期
	})

	if err != nil {
		return "", fmt.Errorf("生成上传签名失败: %w", err)
	}

	return presignResult.URL, nil
}

// SignToFetch 生成下载签名URL
func (s *OSSService) SignToFetch(objectKey string) (string, error) {
	request := &oss.GetObjectRequest{
		Bucket: oss.Ptr(s.config.OSSBucket),
		Key:    oss.Ptr(objectKey),
	}

	presignResult, err := s.client.Presign(context.TODO(), request, func(options *oss.PresignOptions) {
		options.Expiration = time.Now().Add(time.Hour) // 1小时过期
	})

	if err != nil {
		return "", fmt.Errorf("生成下载签名失败: %w", err)
	}

	return presignResult.URL, nil
}

// HashifyName 生成哈希文件名，防止重名
func (s *OSSService) HashifyName(fileName string) string {
	// 处理路径，只取文件名部分
	name := filepath.Base(fileName)
	if name == "" {
		name = "unknown"
	}

	// 获取文件扩展名
	ext := filepath.Ext(name)
	nameWithoutExt := strings.TrimSuffix(name, ext)

	// 生成时间戳（毫秒）
	timestamp := time.Now().UnixMilli()

	// 生成6位36进制随机字符串，与JavaScript版本保持一致
	randomStr := genBase36String(6)

	return fmt.Sprintf("%s_%d_%s%s", nameWithoutExt, timestamp, randomStr, ext)
}

// UploadFile 直接上传文件到OSS
func (s *OSSService) UploadFile(file multipart.File, objectKey string, contentType string) error {
	// 读取文件内容
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return fmt.Errorf("读取文件内容失败: %w", err)
	}

	request := &oss.PutObjectRequest{
		Bucket:      oss.Ptr(s.config.OSSBucket),
		Key:         oss.Ptr(objectKey),
		Body:        bytes.NewReader(fileBytes),
		ContentType: oss.Ptr(contentType),
	}

	_, err = s.client.PutObject(context.TODO(), request)
	if err != nil {
		return fmt.Errorf("上传文件到OSS失败: %w", err)
	}

	logrus.WithFields(logrus.Fields{
		"objectKey":   objectKey,
		"contentType": contentType,
		"size":        len(fileBytes),
	}).Info("文件上传成功")

	return nil
}

// DeleteFile 删除OSS文件
func (s *OSSService) DeleteFile(objectKey string) error {
	request := &oss.DeleteObjectRequest{
		Bucket: oss.Ptr(s.config.OSSBucket),
		Key:    oss.Ptr(objectKey),
	}

	_, err := s.client.DeleteObject(context.TODO(), request)
	if err != nil {
		return fmt.Errorf("删除OSS文件失败: %w", err)
	}

	logrus.WithField("objectKey", objectKey).Info("文件删除成功")
	return nil
}

// GetFileURL 获取文件访问URL
func (s *OSSService) GetFileURL(objectKey string) (string, error) {
	return s.SignToFetch(objectKey)
}

// GetPublicUrl 获取公共读文件的URL
func (s *OSSService) GetPublicUrl(objectKey string) string {
	return fmt.Sprintf("https://%s.%s.aliyuncs.com/%s", s.config.OSSBucket, s.config.OSSRegion, objectKey)
}

// GetFileList 获取文件列表
func (s *OSSService) GetFileList(prefix string, maxKeys int) (*models.FileListResponse, error) {
	if maxKeys <= 0 || maxKeys > 1000 {
		maxKeys = 100 // 默认100，最大1000
	}

	request := &oss.ListObjectsV2Request{
		Bucket:  oss.Ptr(s.config.OSSBucket),
		Prefix:  oss.Ptr(prefix),
		MaxKeys: int32(maxKeys),
	}

	result, err := s.client.ListObjectsV2(context.TODO(), request)
	if err != nil {
		return nil, fmt.Errorf("获取文件列表失败: %w", err)
	}

	files := make([]models.FileInfo, 0, len(result.Contents))
	for _, obj := range result.Contents {
		// 为每个文件生成临时访问URL
		url, urlErr := s.SignToFetch(*obj.Key)
		if urlErr != nil {
			logrus.WithField("objectKey", *obj.Key).Warn("生成文件URL失败")
			url = "" // URL生成失败时设为空
		}

		files = append(files, models.FileInfo{
			Name:         *obj.Key,
			Size:         obj.Size,
			LastModified: *obj.LastModified,
			ObjectKey:    *obj.Key,
			URL:          url,
		})
	}

	response := &models.FileListResponse{
		Files:       files,
		IsTruncated: result.IsTruncated,
	}

	if result.NextContinuationToken != nil {
		response.NextMarker = *result.NextContinuationToken
	}

	return response, nil
}

// ValidateFile 验证文件是否符合上传条件
func (s *OSSService) ValidateFile(fileHeader *multipart.FileHeader) error {
	const maxFileSize = 10 * 1024 * 1024 // 10MB

	// 检查文件大小
	if fileHeader.Size > maxFileSize {
		return fmt.Errorf("文件大小不能超过10MB，当前大小: %d", fileHeader.Size)
	}

	// 检查文件名长度
	if len(fileHeader.Filename) == 0 || len(fileHeader.Filename) > 255 {
		return fmt.Errorf("文件名无效或过长")
	}

	// 检查文件类型
	contentType := fileHeader.Header.Get("Content-Type")
	allowedTypes := []string{
		"image/", "video/", "audio/",
		"application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument",
		"text/", "application/json", "application/zip", "application/x-rar-compressed",
	}

	isAllowed := false
	for _, allowedType := range allowedTypes {
		if strings.HasPrefix(contentType, allowedType) {
			isAllowed = true
			break
		}
	}

	if !isAllowed {
		return fmt.Errorf("不支持的文件类型: %s", contentType)
	}

	return nil
}

// 修正region格式：如果包含oss-前缀则移除
// go版本无论是oss还是sts，都要去掉前缀，但是前端nodejs却不需要
func cutRegionPrefix(region string) string {
	region, _ = strings.CutPrefix(region, "oss-")
	return region
}

// genBase36String 生成指定长度的36进制随机字符串
func genBase36String(length int) string {
	const charset = "0123456789abcdefghijklmnopqrstuvwxyz"
	result := make([]byte, length)

	// 使用crypto/rand生成安全的随机数
	randomBytes := make([]byte, length)
	rand.Read(randomBytes)

	for i := range result {
		result[i] = charset[randomBytes[i]%byte(len(charset))]
	}
	return string(result)
}

// ValidateCfg 检查OSS配置是否完整
func (s *OSSService) ValidateCfg() error {
	if s.config.OSSAccessKeyID == "" {
		return fmt.Errorf("OSS_ACCESS_KEY_ID 未配置")
	}
	if s.config.OSSAccessKeySecret == "" {
		return fmt.Errorf("OSS_ACCESS_KEY_SECRET 未配置")
	}
	if s.config.OSSBucket == "" {
		return fmt.Errorf("OSS_BUCKET 未配置")
	}
	if s.config.OSSRegion == "" {
		return fmt.Errorf("OSS_REGION 未配置")
	}
	return nil
}

// ParseMaxKeys 解析maxKeys参数
func ParseMaxKeys(maxKeysStr string) int {
	if maxKeysStr == "" {
		return 100
	}

	maxKeys, err := strconv.Atoi(maxKeysStr)
	if err != nil || maxKeys <= 0 {
		return 100
	}

	if maxKeys > 1000 {
		return 1000
	}

	return maxKeys
}
