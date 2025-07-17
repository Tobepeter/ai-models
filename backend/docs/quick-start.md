# 快速开始指南

## 🚀 5分钟上手指南

### 1. 环境准备

```bash
# 检查 Go 版本
go version
# 需要 Go 1.21 或更高版本

# 进入项目目录
cd /backend

# 复制环境变量文件
cp .env.example .env
```

### 2. 安装依赖

```bash
# 下载项目依赖
go mod tidy

# 验证依赖
go mod verify
```

### 3. 配置环境变量

编辑 `.env` 文件：

```env
# 基本配置（可直接使用）
PORT=8080
ENVIRONMENT=development

# 数据库配置（可选，项目包含模拟数据）
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ai_models

# JWT 密钥（请修改）
JWT_SECRET=your-super-secret-key-here

# AI API 配置（可选）
AI_API_KEY=your-openai-api-key
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-3.5-turbo
```

### 4. 运行项目

```bash
# 运行开发服务器
go run cmd/main.go

# 或者编译后运行
go build -o bin/server cmd/main.go
./bin/server
```

服务器启动后，访问：
- 健康检查：http://localhost:8080/health
- API 文档（如果配置了 Swagger）：http://localhost:8080/swagger/index.html

## 📝 测试 API

### 1. 健康检查

```bash
curl http://localhost:8080/health
```

预期响应：
```json
{
  "code": 200,
  "message": "Service is healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00Z",
    "service": "ai-models-backend",
    "version": "1.0.0"
  }
}
```

### 2. 用户注册

```bash
curl -X POST http://localhost:8080/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. 用户登录

```bash
curl -X POST http://localhost:8080/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

保存返回的 token 用于后续请求。

### 4. 获取用户资料

```bash
curl -X GET http://localhost:8080/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. AI 聊天

```bash
curl -X POST http://localhost:8080/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "message": "Hello, how are you?",
    "model": "gpt-3.5-turbo"
  }'
```

### 6. 获取可用模型

```bash
curl -X GET http://localhost:8080/api/v1/ai/models \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 开发工具推荐

### VS Code 扩展

1. **Go** - 官方 Go 语言支持
2. **REST Client** - 测试 API
3. **Thunder Client** - API 测试工具
4. **GitLens** - Git 增强
5. **Bracket Pair Colorizer** - 括号配对

### 命令行工具

```bash
# 安装有用的工具
go install github.com/air-verse/air@latest          # 热重载
go install github.com/swaggo/swag/cmd/swag@latest   # API 文档生成
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest # 代码检查
```

### 使用 Air 进行热重载

```bash
# 在项目根目录创建 .air.toml
cat > .air.toml << 'EOF'
root = "."
testdata_dir = "testdata"
tmp_dir = "tmp"

[build]
  args_bin = []
  bin = "./tmp/main"
  cmd = "go build -o ./tmp/main ./cmd/main.go"
  delay = 1000
  exclude_dir = ["assets", "tmp", "vendor", "testdata"]
  exclude_file = []
  exclude_regex = ["_test.go"]
  exclude_unchanged = false
  follow_symlink = false
  full_bin = ""
  include_dir = []
  include_ext = ["go", "tpl", "tmpl", "html"]
  kill_delay = "0s"
  log = "build-errors.log"
  send_interrupt = false
  stop_on_root = false

[color]
  app = ""
  build = "yellow"
  main = "magenta"
  runner = "green"
  watcher = "cyan"

[log]
  time = false

[misc]
  clean_on_exit = false
EOF

# 使用 Air 启动
air
```

## 🧪 运行测试

```bash
# 运行所有测试
go test ./...

# 运行特定包的测试
go test ./internal/handlers

# 运行测试并显示覆盖率
go test -cover ./...

# 生成覆盖率报告
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

## 📦 构建和部署

### 本地构建

```bash
# 构建可执行文件
go build -o bin/server cmd/main.go

# 交叉编译
GOOS=linux GOARCH=amd64 go build -o bin/server-linux cmd/main.go
```

### Docker 构建

```bash
# 创建 Dockerfile
cat > Dockerfile << 'EOF'
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o main cmd/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
CMD ["./main"]
EOF

# 构建 Docker 镜像
docker build -t ai-models-backend .

# 运行容器
docker run -p 8080:8080 ai-models-backend
```

## 🐛 常见问题

### 1. 端口已被占用

```bash
# 查看端口占用
lsof -i :8080

# 杀死进程
kill -9 PID
```

### 2. 依赖下载失败

```bash
# 设置代理
go env -w GOPROXY=https://goproxy.cn,direct

# 清理模块缓存
go clean -modcache
```

### 3. 数据库连接失败

- 检查数据库服务是否启动
- 验证连接配置
- 确认用户权限

### 4. JWT Token 错误

- 检查 JWT_SECRET 配置
- 确认 token 格式正确
- 验证 token 是否过期

## 📚 下一步学习

1. **阅读代码**：从 `cmd/main.go` 开始，理解项目结构
2. **修改功能**：尝试添加新的 API 端点
3. **学习文档**：阅读 `docs/` 目录下的详细文档
4. **实践项目**：基于这个框架构建自己的应用

## 🤝 获取帮助

- 查看项目文档：`docs/` 目录
- Go 官方文档：https://golang.org/doc/
- Gin 框架文档：https://gin-gonic.com/
- GORM 文档：https://gorm.io/

祝你学习愉快！🎉