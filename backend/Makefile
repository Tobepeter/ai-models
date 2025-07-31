.PHONY: help dev docker-dev docker-down build run test fmt vet clean bootstrap swagger

BINARY_NAME=main
MAIN_PATH=./cmd/main.go

# 默认目标
.DEFAULT_GOAL := help

# 帮助信息
help: ## 显示帮助信息
	@echo "AI Models Backend - 可用命令:"
	@echo ""
	@echo "开发环境:"
	@echo "  dev          启动本地开发环境 (Docker + Air热重载)"
	@echo "  docker-dev   启动完整Docker开发环境"
	@echo "  docker-down  停止Docker环境"
	@echo ""
	@echo "构建和运行:"
	@echo "  build        构建二进制文件"
	@echo "  run          直接运行应用"
	@echo ""
	@echo "测试和代码质量:"
	@echo "  test         运行所有测试"
	@echo "  test-coverage 运行测试并生成覆盖率报告"
	@echo "  test-clean   清理测试文件"
	@echo "  fmt          格式化代码"
	@echo "  vet          静态代码检查"
	@echo ""
	@echo "工具:"
	@echo "  bootstrap    安装开发依赖 (Air)"
	@echo "  swagger      生成 Swagger 文档"
	@echo "  clean        清理构建文件"
	@echo ""
	@echo "使用示例: make dev"

# NOTE: 指定 file 后默认不会应用 docker-compose.override.yml 文件
dev:
	docker-compose -f docker-compose.yml up -d
	IS_AIR_DEV=true air -c .air.toml

docker-dev:
	@echo "🐳 启动 Docker 开发环境..."
	docker-compose up

docker-down:
	docker-compose down

# 构建和运行
build:
	go build -o $(BINARY_NAME) $(MAIN_PATH)

run:
	go run $(MAIN_PATH)

# 工具命令
test:
	go test -v ./...

fmt: ## 格式化代码
	go fmt ./...

vet: ## 静态代码检查
	go vet ./...

clean:
	go clean
	rm -f $(BINARY_NAME)

# NOTE：swag不能用latest，v1.16.5 有一个 segmentation fault 的 bug
bootstrap:
	go install github.com/air-verse/air@latest
	go install github.com/swaggo/swag/cmd/swag@v1.8.12

# 生成 Swagger 文档
# http://localhost:8080/swagger/index.html#/
swagger:
	swag init -g cmd/main.go -o docs/ --parseDependency --parseInternal
	@echo "Swagger 文档已生成到 docs/ 目录"

# 测试覆盖率
test-coverage:
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "覆盖率报告已生成: coverage.html"

# 清理测试文件
test-clean:
	rm -f coverage.out coverage.html

