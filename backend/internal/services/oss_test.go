package services

import (
	"ai-models-backend/internal/testutil"
	"fmt"
	"net/http"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	objKey   = "test/avatar.jpeg"
	fileName = "test_file.jpeg"
	upPrefix = "test/"
)

func TestOSSService_Simple(t *testing.T) {
	testutil.RunWithEnv(t, func(t *testing.T) {
		cfg := testutil.TestConfig
		svc := NewOSSService(cfg)

		// 配置验证
		err := svc.ValidateCfg()
		if err != nil {
			t.Fatalf("OSS配置验证失败: %v", err)
		}
		fmt.Printf("✅ OSS配置验证通过\n")

		// 公共读 直接下载
		pubUrl := svc.GetPublicUrl(objKey)
		size := testutil.DownloadFile(t, pubUrl, fileName)
		defer testutil.CleanupFile(fileName)
		fmt.Printf("✅ 文件下载成功，大小: %d bytes\n", size)

		// 文件上传 - 使用下载的文件
		uploadFile, err := testutil.OpenFileAsMultipart(fileName)
		require.NoError(t, err, "打开下载文件失败")
		defer uploadFile.Close()

		upKey := upPrefix + svc.HashifyName(fileName)
		err = svc.UploadFile(uploadFile, upKey, "image/jpeg")
		require.NoError(t, err, "文件上传失败")
		fmt.Printf("✅ 文件上传成功: %s\n", upKey)

		// 验证上传成功 - 直接请求公共URL
		uploadPubUrl := svc.GetPublicUrl(upKey)
		resp, err := http.Head(uploadPubUrl)
		require.NoError(t, err, "请求上传文件URL失败")
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode, "上传文件应该可以通过公共URL访问")
		fmt.Printf("✅ 上传文件公共URL验证成功: %s (状态码: %d)\n", uploadPubUrl, resp.StatusCode)

		// 清理上传的文件
		err = svc.DeleteFile(upKey)
		require.NoError(t, err, "删除上传文件失败")
		fmt.Printf("✅ 上传文件删除成功: %s\n", upKey)
	})
}

func TestOSSService_Sign(t *testing.T) {
	testutil.RunWithEnv(t, func(t *testing.T) {
		cfg := testutil.TestConfig
		svc := NewOSSService(cfg)

		// 配置验证
		err := svc.ValidateCfg()
		if err != nil {
			t.Fatalf("OSS配置验证失败: %v", err)
		}

		// 使用签名URL下载
		signedUrl, err := svc.SignToFetch(objKey)
		require.NoError(t, err, "生成下载签名URL失败")

		size := testutil.DownloadFile(t, signedUrl, fileName)
		defer testutil.CleanupFile(fileName)
		fmt.Printf("✅ 签名URL下载成功，大小: %d bytes\n", size)

		// 生成上传签名URL
		upKey := upPrefix + svc.HashifyName(fileName)
		upUrl, err := svc.SignToUpload(upKey, "image/jpeg")
		require.NoError(t, err, "生成上传签名URL失败")
		assert.NotEmpty(t, upUrl)
		fmt.Printf("✅ 上传签名URL生成成功: %s\n", upUrl)

		// 模拟前端：使用签名URL上传文件
		uploadFile, err := os.Open(fileName)
		require.NoError(t, err, "打开本地文件失败")
		defer uploadFile.Close()

		// HTTP PUT请求到签名URL上传文件（模拟前端行为）
		req, err := http.NewRequest("PUT", upUrl, uploadFile)
		require.NoError(t, err, "创建上传请求失败")
		req.Header.Set("Content-Type", "image/jpeg")

		client := &http.Client{}
		resp, err := client.Do(req)
		require.NoError(t, err, "执行上传请求失败")
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode, "上传应该成功")
		fmt.Printf("✅ 通过签名URL上传成功 (状态码: %d)\n", resp.StatusCode)

		// 验证上传成功 - 直接请求公共URL
		uploadPubUrl := svc.GetPublicUrl(upKey)
		verifyResp, err := http.Head(uploadPubUrl)
		require.NoError(t, err, "请求上传文件URL失败")
		defer verifyResp.Body.Close()

		assert.Equal(t, http.StatusOK, verifyResp.StatusCode, "上传文件应该可以通过公共URL访问")
		fmt.Printf("✅ 上传文件公共URL验证成功: %s (状态码: %d)\n", uploadPubUrl, verifyResp.StatusCode)

		// 清理上传的文件（delete没有sign，直接调用服务方法）
		err = svc.DeleteFile(upKey)
		require.NoError(t, err, "删除上传文件失败")
		fmt.Printf("✅ 上传文件删除成功: %s\n", upKey)
	})
}

func TestOSSService_STS(t *testing.T) {
	testutil.RunWithEnv(t, func(t *testing.T) {
		cfg := testutil.TestConfig
		svc := NewOSSService(cfg)

		// 配置验证
		err := svc.ValidateCfg()
		if err != nil {
			t.Fatalf("OSS配置验证失败: %v", err)
		}

		// 检查是否配置了RoleArn
		if cfg.OSSRoleArn == "" {
			t.Fatal("OSS_ROLE_ARN 未配置")
		}

		// 测试STS临时凭证获取
		cred, err := svc.GetSTSCredentials()
		require.NoError(t, err, "获取STS凭证失败")

		assert.NotEmpty(t, cred.AccessKeyID, "STS AccessKeyID不应为空")
		assert.NotEmpty(t, cred.AccessKeySecret, "STS AccessKeySecret不应为空")
		assert.NotEmpty(t, cred.SecurityToken, "STS SecurityToken不应为空")
		assert.NotEmpty(t, cred.Expiration, "STS Expiration不应为空")

		// NOTE: sts 的上传，获取和删除很难测，一般是sdk完成的，这里不做了
	})
}
