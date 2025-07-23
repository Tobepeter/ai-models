package main

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"strings"
)

const (
	VOLUME_NAME    = "postgres_data"
	CONTAINER_NAME = "ai-models-db"
)

// 检查 Docker 是否在运行
func checkDockerRunning() bool {
	cmd := exec.Command("docker", "ps")
	err := cmd.Run()
	return err == nil
}

// 检查指定容器是否在运行
func checkContainerRunning(containerName string) bool {
	cmd := exec.Command("docker", "ps", "--filter", fmt.Sprintf("name=%s", containerName), "--format", "{{.Names}}")
	output, err := cmd.Output()
	if err != nil {
		return false
	}
	return strings.Contains(string(output), containerName)
}

// 检查 Docker 卷是否存在
func checkVolumeExists(volumeName string) bool {
	cmd := exec.Command("docker", "volume", "inspect", volumeName)
	err := cmd.Run()
	return err == nil
}

// 获取用户确认
func getUserConfirmation(message string) bool {
	fmt.Printf("%s (y/N): ", message)
	reader := bufio.NewReader(os.Stdin)
	input, _ := reader.ReadString('\n')
	input = strings.TrimSpace(strings.ToLower(input))
	return input == "y" || input == "yes"
}

// 删除 Docker 卷
func removeVolume(volumeName string, force bool) error {
	fmt.Printf("🗑️  删除 Docker 卷: %s\n", volumeName)

	var cmd *exec.Cmd
	if force {
		cmd = exec.Command("docker", "volume", "rm", "-f", volumeName)
	} else {
		cmd = exec.Command("docker", "volume", "rm", volumeName)
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		outputStr := string(output)
		if strings.Contains(outputStr, "No such volume") {
			fmt.Printf("ℹ️  卷 %s 不存在，跳过删除\n", volumeName)
			return nil
		} else if strings.Contains(outputStr, "volume is in use") {
			fmt.Printf("⚠️  卷 %s 正在使用中\n", volumeName)
			if !force {
				fmt.Printf("💡 请手动停止相关容器后重试: docker stop %s\n", CONTAINER_NAME)
				return fmt.Errorf("卷正在使用中")
			}
			// 尝试强制删除
			fmt.Printf("🚀 强制模式：尝试强制删除...\n")
			forceCmd := exec.Command("docker", "volume", "rm", "-f", volumeName)
			forceOutput, forceErr := forceCmd.CombinedOutput()
			if forceErr != nil {
				fmt.Printf("❌ 强制删除失败: %s\n", string(forceOutput))
				return forceErr
			}
		} else {
			return fmt.Errorf("删除卷失败: %s", outputStr)
		}
	}

	fmt.Printf("✅ 成功删除卷: %s\n", volumeName)
	return nil
}

// 显示状态信息
func showStatus() {
	fmt.Println("🔍 检查 Docker 和数据库状态...")
	fmt.Println()

	// 检查 Docker 状态
	dockerRunning := checkDockerRunning()
	if dockerRunning {
		fmt.Println("🐳 Docker 状态: ✅ 运行中")
	} else {
		fmt.Println("🐳 Docker 状态: ❌ 未运行")
		fmt.Println("💡 请启动 Docker 以查看完整状态信息")
		return
	}

	// 检查容器状态
	containerRunning := checkContainerRunning(CONTAINER_NAME)
	if containerRunning {
		fmt.Printf("📦 容器 %s: ✅ 运行中\n", CONTAINER_NAME)
	} else {
		fmt.Printf("📦 容器 %s: ❌ 未运行\n", CONTAINER_NAME)
	}

	// 检查卷状态
	volumeExists := checkVolumeExists(VOLUME_NAME)
	if volumeExists {
		fmt.Printf("💾 数据卷 %s: ✅ 存在\n", VOLUME_NAME)
	} else {
		fmt.Printf("💾 数据卷 %s: ❌ 不存在\n", VOLUME_NAME)
	}

	fmt.Println()
	fmt.Println("📋 相关命令:")
	fmt.Println("   启动数据库: docker-compose up -d")
	fmt.Printf("   停止容器: docker stop %s\n", CONTAINER_NAME)
	fmt.Println("   删除数据卷: go run skpl.go")
}

// SKPL 主功能
func skpl(force bool) error {
	fmt.Println("🗑️  开始清理数据库持久化数据...")

	// 检查 Docker 是否运行
	if !checkDockerRunning() {
		fmt.Println("ℹ️  Docker 未运行，无法清理 Docker 卷数据")
		fmt.Println("💡 如果需要清理数据库，请按以下步骤操作：")
		fmt.Println("   1. 启动 Docker")
		fmt.Println("   2. 重新运行此命令")
		fmt.Println()
		fmt.Println("📋 或者手动执行以下命令清理数据：")
		fmt.Printf("   docker volume rm %s\n", VOLUME_NAME)
		fmt.Println("   # 如果卷正在使用中，先停止容器：")
		fmt.Printf("   docker stop %s\n", CONTAINER_NAME)
		fmt.Printf("   docker volume rm %s\n", VOLUME_NAME)
		return nil
	}

	fmt.Println("⚠️  Docker 正在运行，检查相关容器状态...")

	// 检查数据库容器是否在运行
	if checkContainerRunning(CONTAINER_NAME) {
		fmt.Printf("⚠️  容器 %s 正在运行！\n", CONTAINER_NAME)
		fmt.Println("⚠️  建议先停止容器再清理数据，否则可能导致数据不一致")
		fmt.Printf("⚠️  可以运行: docker stop %s\n", CONTAINER_NAME)

		if !force {
			if !getUserConfirmation("是否继续清理数据？") {
				fmt.Println("❌ 操作已取消")
				return nil
			}
		} else {
			fmt.Println("🚀 强制模式：跳过确认，继续清理数据")
		}
	}

	// 删除卷
	err := removeVolume(VOLUME_NAME, force)
	if err != nil {
		return err
	}

	fmt.Println("🎉 数据库持久化数据清理完成！")
	fmt.Println("💡 下次启动时将创建全新的数据库")
	return nil
}

// 显示帮助信息
func showHelp() {
	fmt.Println("SKPL (Skip PostgreSQL) - 数据库重置工具")
	fmt.Println()
	fmt.Println("用法:")
	fmt.Println("  go run skpl.go [选项]")
	fmt.Println()
	fmt.Println("选项:")
	fmt.Println("  -f, --force    强制删除，不询问确认")
	fmt.Println("  -s, --status   显示 Docker 和数据库状态")
	fmt.Println("  -h, --help     显示帮助信息")
	fmt.Println()
	fmt.Println("示例:")
	fmt.Println("  go run skpl.go              # 交互式删除数据库数据")
	fmt.Println("  go run skpl.go --force      # 强制删除数据库数据")
	fmt.Println("  go run skpl.go --status     # 检查状态")
	fmt.Println()
	fmt.Println("功能:")
	fmt.Printf("  - 删除 Docker 卷: %s\n", VOLUME_NAME)
	fmt.Printf("  - 检查容器状态: %s\n", CONTAINER_NAME)
	fmt.Println("  - 智能安全检查和用户确认")
}

func main() {
	args := os.Args[1:]

	// 解析参数
	force := false
	showStatusFlag := false
	showHelpFlag := false

	for _, arg := range args {
		switch arg {
		case "-f", "--force":
			force = true
		case "-s", "--status":
			showStatusFlag = true
		case "-h", "--help":
			showHelpFlag = true
		}
	}

	// 处理命令
	if showHelpFlag || len(args) == 0 {
		showHelp()
		return
	}

	if showStatusFlag {
		showStatus()
		return
	}

	// 执行 SKPL
	if force {
		fmt.Println("🚀 强制模式：跳过确认直接清理数据库数据")
	}

	err := skpl(force)
	if err != nil {
		fmt.Printf("❌ 操作失败: %v\n", err)
		os.Exit(1)
	}
}
