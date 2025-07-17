# AI Models Backend - Go Learning Documentation

## 项目概述

这是一个基于 Go 语言构建的 AI 模型后端服务，专为初学者设计。项目包含了一个完整的 Web API 框架，涵盖了 Go 语言开发的核心概念和最佳实践。

## 🚀 快速开始

### 环境要求

- Go 1.21 或更高版本
- Git
- 任意文本编辑器或 IDE（推荐 VS Code）

### 安装和运行

```bash
# 克隆项目
cd /backend

# 下载依赖
go mod tidy

# 运行项目
go run cmd/main.go
```

## 📚 学习路径

1. **[Go 基础语法](go-basics.md)** - 变量、函数、控制流程
2. **[Go 数据结构](go-data-structures.md)** - 切片、映射、结构体
3. **[Go 并发编程](go-concurrency.md)** - Goroutines 和 Channels
4. **[Web 开发基础](web-development.md)** - HTTP 服务器、路由、中间件
5. **[数据库操作](database.md)** - GORM 和数据库连接
6. **[API 设计](api-design.md)** - RESTful API 设计原则
7. **[认证授权](authentication.md)** - JWT 和用户认证
8. **[错误处理](error-handling.md)** - Go 错误处理最佳实践
9. **[测试](testing.md)** - 单元测试和集成测试
10. **[部署](deployment.md)** - 生产环境部署指南

## 🏗️ 项目结构

```
backend/
├── cmd/                    # 应用程序入口点
│   └── main.go
├── internal/               # 内部应用程序代码
│   ├── config/            # 配置管理
│   ├── handlers/          # HTTP 请求处理器
│   ├── middleware/        # 中间件
│   ├── models/            # 数据模型
│   └── services/          # 业务逻辑
├── pkg/                   # 可重用的包
│   ├── response/          # 响应格式化
│   └── utils/             # 工具函数
├── docs/                  # 项目文档
├── go.mod                 # Go 模块文件
└── README.md
```

## 🔧 核心功能

### 1. 用户管理
- 用户注册和登录
- JWT 认证
- 用户信息管理

### 2. AI 服务集成
- 聊天接口
- 文本生成
- 模型管理
- 流式响应

### 3. 中间件系统
- 请求日志记录
- 错误恢复
- CORS 支持
- 认证验证

### 4. 响应格式化
- 统一的 API 响应格式
- 错误处理
- 成功响应

## 🎯 API 端点

### 健康检查
```
GET /health
```

### 用户相关
```
POST /api/v1/users/register    # 用户注册
POST /api/v1/users/login       # 用户登录
GET  /api/v1/users/profile     # 获取用户资料
PUT  /api/v1/users/profile     # 更新用户资料
```

### AI 服务
```
POST /api/v1/ai/chat           # 聊天接口
POST /api/v1/ai/generate       # 文本生成
GET  /api/v1/ai/models         # 获取可用模型
```

## 📖 核心概念解释

### 1. 包（Package）
Go 中的包是代码组织的基本单位，类似于其他语言的模块或库。

### 2. 模块（Module）
Go 模块是相关包的集合，使用 `go.mod` 文件定义。

### 3. 接口（Interface）
Go 的接口定义了类型应该实现的方法集合。

### 4. 结构体（Struct）
Go 中的结构体是将相关数据组合在一起的方式。

### 5. 方法（Method）
方法是附加到特定类型的函数。

## 🔐 环境变量

创建 `.env` 文件：

```env
# 服务器配置
PORT=8080
ENVIRONMENT=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=ai_models

# Redis 配置
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT 配置
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=24h

# AI 服务配置
AI_API_KEY=your-ai-api-key
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-3.5-turbo
AI_TIMEOUT=30s
```

## 📝 开发建议

1. **从基础开始**：先理解 Go 的基本语法
2. **实践为主**：通过修改现有代码来学习
3. **逐步扩展**：先掌握一个模块，再学习下一个
4. **阅读文档**：Go 官方文档是最好的学习资源
5. **调试技巧**：学会使用 `fmt.Printf` 和调试工具

## 🚨 常见错误

1. **忘记错误处理**：Go 中必须显式处理错误
2. **内存泄漏**：注意 Goroutines 的生命周期
3. **并发安全**：使用 mutex 保护共享数据
4. **包循环依赖**：避免包之间的循环引用

## 📚 推荐资源

- [Go 官方文档](https://golang.org/doc/)
- [Go by Example](https://gobyexample.com/)
- [Effective Go](https://golang.org/doc/effective_go.html)
- [Go 语言圣经](https://gopl.io/)

## 💡 下一步

1. 完成基础语法学习
2. 实现自己的 API 端点
3. 添加数据库连接
4. 实现单元测试
5. 学习部署和监控

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License