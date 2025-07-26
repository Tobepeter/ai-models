package models

import "time"

// STS临时凭证
type STSCredentials struct {
	// NOTE：注意官方的字段是大写开头的
	AccessKeyID     string `json:"AccessKeyId"`
	AccessKeySecret string `json:"AccessKeySecret"`
	SecurityToken   string `json:"SecurityToken"`
	Expiration      string `json:"Expiration"`
}

// STS响应
type STSResponse struct {
	Credentials STSCredentials `json:"credentials"`
}

// 签名请求
type SignRequest struct {
	ObjectKey string `json:"objectKey,omitempty"` // 完整的objectKey，如果提供则直接使用
	FileType  string `json:"fileType,omitempty"`  // 文件类型，用于路径计算
	Prefix    string `json:"prefix,omitempty"`    // 路径前缀
	FileName  string `json:"fileName,omitempty"`  // 文件名
}

// 签名响应
type SignResponse struct {
	SignedURL string `json:"signedUrl"`
	ObjectKey string `json:"objectKey"`
}

// 哈希文件名请求
type HashifyNameRequest struct {
	FileName string `json:"fileName" binding:"required"`
}

// 哈希文件名响应
type HashifyNameResponse struct {
	HashifyName string `json:"hashifyName"`
}

// 文件上传请求
type FileUploadRequest struct {
	Prefix    string `form:"prefix"`
	FileName  string `form:"fileName"`
	ObjectKey string `form:"objectKey"` // 直接指定完整的objectKey，优先级最高
	NoPreview string `form:"noPreview"`
}

// 文件上传响应
type FileUploadResponse struct {
	ObjectKey   string `json:"objectKey"`
	URL         string `json:"url,omitempty"`
	HashifyName string `json:"hashifyName,omitempty"` // 哈希化文件名
	Size        int64  `json:"size"`
	Type        string `json:"type"`
	UploadTime  string `json:"uploadTime"`
}

// 获取URL请求
type GetURLRequest struct {
	ObjectKey string `json:"objectKey" binding:"required"`
}

// 获取URL响应
type GetURLResponse struct {
	URL       string `json:"url"`
	ObjectKey string `json:"objectKey"`
}

// 删除文件请求
type DeleteFileRequest struct {
	ObjectKey string `json:"objectKey" binding:"required"`
}

// 文件列表查询参数
type FileListQuery struct {
	Prefix  string `form:"prefix"`
	MaxKeys int    `form:"maxKeys"`
}

// 文件信息
type FileInfo struct {
	Name         string    `json:"name"`
	Size         int64     `json:"size"`
	LastModified time.Time `json:"lastModified"`
	ObjectKey    string    `json:"objectKey"`
	URL          string    `json:"url"`
}

// 文件列表响应
type FileListResponse struct {
	Files       []FileInfo `json:"files"`
	IsTruncated bool       `json:"isTruncated"`
	NextMarker  string     `json:"nextMarker,omitempty"`
}
