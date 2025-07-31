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
	Credentials STSCredentials
}

// 签名请求
type SignRequest struct {
	ObjectKey string `json:",omitempty"` // 完整的objectKey，如果提供则直接使用
	FileType  string `json:",omitempty"` // 文件类型，用于路径计算
	Prefix    string `json:",omitempty"` // 路径前缀
	FileName  string `json:",omitempty"` // 文件名
}

// 签名响应
type SignResponse struct {
	SignedURL string
	ObjectKey string
}

// 哈希文件名请求
type HashifyNameRequest struct {
	FileName string `binding:"required"`
}

// 哈希文件名响应
type HashifyNameResponse struct {
	HashifyName string
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
	ObjectKey   string
	URL         string `json:",omitempty"`
	HashifyName string `json:",omitempty"` // 哈希化文件名
	Size        int64
	Type        string
	UploadTime  string
}

// 获取URL请求
type GetURLRequest struct {
	ObjectKey string `binding:"required"`
}

// 获取URL响应
type GetURLResponse struct {
	URL       string
	ObjectKey string
}

// 删除文件请求
type DeleteFileRequest struct {
	ObjectKey string `binding:"required"`
}

// 文件列表查询参数
type FileListQuery struct {
	Prefix  string `form:"prefix"`
	MaxKeys int    `form:"maxKeys"`
}

// 文件信息
type FileInfo struct {
	Name         string
	Size         int64
	LastModified time.Time
	ObjectKey    string
	URL          string
}

// 文件列表响应
type FileListResponse struct {
	Files       []FileInfo
	IsTruncated bool
	NextMarker  string `json:",omitempty"`
}
