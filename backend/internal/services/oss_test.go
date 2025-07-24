package services

import (
	"ai-models-backend/internal/config"
	"ai-models-backend/internal/testutil"
	"fmt"
	"io"
	"net/http"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestOSSService(t *testing.T) {
	testutil.RunWithEnv(t, func(t *testing.T) {
		// 使用加载的环境配置
		cfg := testutil.TestConfig
		ossService := NewOSSService(cfg)

		// 显示加载的配置信息
		t.Logf("OSS配置信息: Region=%s, Bucket=%s", cfg.OSSRegion, cfg.OSSBucket)

		t.Run("测试哈希文件名生成", func(t *testing.T) {
			testCases := []struct {
				name     string
				fileName string
			}{
				{"普通文件名", "avatar.jpeg"},
				{"带路径的文件名", "path/to/file.png"},
				{"无扩展名", "filename"},
				{"中文文件名", "头像.jpg"},
			}

			for _, tc := range testCases {
				t.Run(tc.name, func(t *testing.T) {
					result := ossService.HashifyName(tc.fileName)
					assert.NotEmpty(t, result, "哈希文件名不应为空")
					assert.NotEqual(t, tc.fileName, result, "哈希文件名应与原文件名不同")

					fmt.Printf("原文件名: %s -> 哈希文件名: %s\n", tc.fileName, result)

					// 验证格式：原名_时间戳_随机字符串.扩展名
					assert.Regexp(t, `.*_\d+_[a-z0-9]{6}`, result, "应包含时间戳和随机字符串")
				})
			}
		})

		t.Run("测试配置验证", func(t *testing.T) {
			// 测试完整配置
			err := ossService.ValidateConfig()
			if err != nil {
				t.Logf("OSS配置验证失败: %v", err)
				t.Skip("跳过真实OSS测试，OSS配置不完整")
			}

			t.Logf("✅ OSS配置验证通过")

			// 测试缺少AccessKeyID的情况
			invalidCfg := &config.Config{
				OSSAccessKeyID:     "",
				OSSAccessKeySecret: "test_secret",
				OSSBucket:          "test_bucket",
				OSSRegion:          "test_region",
			}
			invalidService := NewOSSService(invalidCfg)
			err = invalidService.ValidateConfig()
			assert.Error(t, err, "缺少AccessKeyID应该验证失败")
			assert.Contains(t, err.Error(), "OSS_ACCESS_KEY_ID", "错误信息应包含AccessKeyID")
		})

		// 验证配置，如果配置不完整则跳过网络相关测试
		if err := ossService.ValidateConfig(); err != nil {
			t.Logf("OSS配置不完整，跳过网络相关测试: %v", err)
			return
		}

		// 测试文件路径
		testObjectKey := "test/avatar.jpeg"
		localFileName := "avatar_test.jpeg"

		t.Run("测试获取文件签名URL并下载", func(t *testing.T) {
			// 生成下载签名URL
			signedURL, err := ossService.SignToFetch(testObjectKey)
			require.NoError(t, err, "生成下载签名URL失败")
			assert.NotEmpty(t, signedURL, "签名URL不应为空")

			fmt.Printf("获取到签名URL: %s\n", signedURL)

			// 创建带超时的HTTP客户端
			client := &http.Client{
				Timeout: 30 * time.Second,
			}

			// 下载文件到当前位置
			resp, err := client.Get(signedURL)
			if err != nil {
				t.Logf("网络请求失败: %v", err)
				t.Skip("网络连接问题，跳过下载测试")
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				t.Logf("下载响应状态码: %d", resp.StatusCode)
				t.Skip("文件可能不存在，跳过下载测试")
			}

			// 保存文件到本地
			outFile, err := os.Create(localFileName)
			require.NoError(t, err, "创建本地文件失败")
			defer outFile.Close()

			_, err = io.Copy(outFile, resp.Body)
			require.NoError(t, err, "保存文件失败")

			// 验证文件是否存在且有内容
			fileInfo, err := os.Stat(localFileName)
			require.NoError(t, err, "检查文件状态失败")
			assert.Greater(t, fileInfo.Size(), int64(0), "文件大小应大于0")

			fmt.Printf("✅ 文件下载成功，大小: %d bytes\n", fileInfo.Size())
		})

		t.Run("测试文件列表获取", func(t *testing.T) {
			// 获取test/目录下的文件列表
			fileList, err := ossService.GetFileList("test/", 10)
			if err != nil {
				t.Logf("获取文件列表失败: %v", err)
				t.Skip("网络连接问题，跳过文件列表测试")
			}

			assert.NotNil(t, fileList, "文件列表不应为空")

			if len(fileList.Files) > 0 {
				// 检查是否包含目标文件
				found := false
				for _, file := range fileList.Files {
					fmt.Printf("发现文件: %s, 大小: %d\n", file.ObjectKey, file.Size)
					if file.ObjectKey == testObjectKey {
						found = true
						fmt.Printf("✅ 找到目标文件: %s, 大小: %d, 修改时间: %s\n",
							file.ObjectKey, file.Size, file.LastModified.Format("2006-01-02 15:04:05"))
					}
				}

				if found {
					t.Log("✅ 成功找到目标文件")
				} else {
					t.Log("⚠️ 未找到目标文件，但列表获取正常")
				}
			} else {
				t.Log("ℹ️ test/目录下没有文件")
			}
		})

		t.Run("测试哈希文件名与签名生成", func(t *testing.T) {
			originalName := "test-upload.txt"
			hashName := ossService.HashifyName(originalName)

			assert.NotEmpty(t, hashName, "哈希文件名不应为空")
			assert.NotEqual(t, originalName, hashName, "哈希文件名应与原文件名不同")
			assert.Regexp(t, `test-upload_\d+_[a-z0-9]{6}\.txt`, hashName, "应匹配哈希文件名格式")

			fmt.Printf("哈希文件名: %s\n", hashName)

			// 测试生成上传签名
			uploadURL, err := ossService.SignToUpload(hashName, "text/plain")
			require.NoError(t, err, "生成上传签名失败")
			assert.NotEmpty(t, uploadURL, "上传签名URL不应为空")

			fmt.Printf("✅ 上传签名URL生成成功\n")
		})

		// 清理：删除下载的测试文件
		t.Cleanup(func() {
			if _, err := os.Stat(localFileName); err == nil {
				os.Remove(localFileName)
				fmt.Printf("🧹 清理测试文件: %s\n", localFileName)
			}
		})
	})
}
