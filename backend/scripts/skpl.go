package main

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"strings"
)

const (
	VolumName = "postgres_data"
	ContName  = "ai-models-db"
)

func main() {
	args := os.Args[1:]

	// 简单参数检查
	force := false
	for _, arg := range args {
		if arg == "--force" || arg == "-f" {
			force = true
		}
	}

	fmt.Println("🗑️ SKPL - 删除 PostgreSQL 数据库卷")

	// 检查 Docker 是否运行
	cmd := exec.Command("docker", "ps")
	if err := cmd.Run(); err != nil {
		fmt.Println("❌ Docker 未运行，请先启动 Docker")
		fmt.Printf("💡 手动删除命令: docker volume rm %s\n", VolumName)
		os.Exit(1)
	}

	// 检查容器是否运行
	checkCmd := exec.Command("docker", "ps", "--filter", fmt.Sprintf("name=%s", ContName), "--format", "{{.Names}}")
	output, _ := checkCmd.Output()
	if strings.Contains(string(output), ContName) {
		fmt.Printf("⚠️ 容器 %s 正在运行\n", ContName)
		if !force {
			fmt.Printf("💡 请先停止容器: docker stop %s\n", ContName)
			fmt.Println("💡 或使用 --force 强制删除")
			os.Exit(1)
		}
	}

	// 交互式确认（除非使用 --force）
	if !force {
		fmt.Printf("⚠️ 即将删除数据库卷 %s，所有数据将丢失！\n", VolumName)
		fmt.Print("确认删除？(y/N): ")

		reader := bufio.NewReader(os.Stdin)
		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(strings.ToLower(input))

		if input != "y" && input != "yes" {
			fmt.Println("❌ 操作已取消")
			os.Exit(0)
		}
	}

	// 删除卷
	fmt.Printf("🗑️ 删除数据卷: %s\n", VolumName)
	rmCmd := exec.Command("docker", "volume", "rm", VolumName)
	if force {
		rmCmd = exec.Command("docker", "volume", "rm", "-f", VolumName)
	}

	if err := rmCmd.Run(); err != nil {
		fmt.Printf("❌ 删除失败: %v\n", err)
		fmt.Printf("💡 手动删除: docker volume rm %s\n", VolumName)
		os.Exit(1)
	}

	fmt.Println("✅ 数据库卷删除成功")
}
