package testutil

import (
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

// DownloadFile 下载文件到本地并返回文件大小
func DownloadFile(t *testing.T, url, filename string) int64 {
	resp, err := http.Get(url)
	require.NoError(t, err, "下载文件失败")
	defer resp.Body.Close()

	require.Equal(t, http.StatusOK, resp.StatusCode, "下载响应状态码应为200")

	file, err := os.Create(filename)
	require.NoError(t, err, "创建文件失败")
	defer file.Close()

	size, err := io.Copy(file, resp.Body)
	require.NoError(t, err, "写入文件失败")

	return size
}

// CleanupFile 清理测试文件
func CleanupFile(filename string) {
	if err := os.Remove(filename); err != nil {
		fmt.Printf("警告: 清理文件失败 %s: %v\n", filename, err)
	}
}

// OpenFileAsMultipart 打开本地文件作为multipart.File
func OpenFileAsMultipart(filePath string) (multipart.File, error) {
	return os.Open(filePath)
}
