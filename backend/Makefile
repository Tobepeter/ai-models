.PHONY: dev docker-dev docker-down build run test clean bootstrap

BINARY_NAME=main
MAIN_PATH=./cmd/main.go

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

clean:
	go clean
	rm -f $(BINARY_NAME)

bootstrap:
	go install github.com/air-verse/air@latest

# 测试覆盖率
test-coverage:
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "覆盖率报告已生成: coverage.html"

# 清理测试文件
test-clean:
	rm -f coverage.out coverage.html

