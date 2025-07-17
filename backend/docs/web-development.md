# Go Web 开发

## 目录
- [HTTP 基础](#http-基础)
- [Gin 框架](#gin-框架)
- [路由和中间件](#路由和中间件)
- [请求处理](#请求处理)
- [响应格式](#响应格式)
- [错误处理](#错误处理)

## HTTP 基础

### 原生 HTTP 服务器

```go
package main

import (
    "fmt"
    "net/http"
)

func main() {
    // 处理函数
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello, World!")
    })
    
    http.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
        switch r.Method {
        case "GET":
            fmt.Fprintf(w, "Get users")
        case "POST":
            fmt.Fprintf(w, "Create user")
        default:
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        }
    })
    
    // 启动服务器
    fmt.Println("Server starting on :8080")
    http.ListenAndServe(":8080", nil)
}
```

## Gin 框架

### 基本设置

```go
package main

import (
    "github.com/gin-gonic/gin"
    "net/http"
)

func main() {
    // 创建 Gin 实例
    r := gin.Default()
    
    // 基本路由
    r.GET("/", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "Hello World",
        })
    })
    
    // 启动服务器
    r.Run(":8080")
}
```

### 项目中的实际使用

```go
// cmd/main.go 中的完整设置
func setupRouter(cfg *config.Config, userHandler *handlers.UserHandler, 
                 aiHandler *handlers.AIHandler, healthHandler *handlers.HealthHandler) *gin.Engine {
    
    if cfg.Environment == "production" {
        gin.SetMode(gin.ReleaseMode)
    }

    r := gin.New()

    // 全局中间件
    r.Use(middleware.Logger())
    r.Use(middleware.Recovery())
    r.Use(middleware.CORS())

    // 健康检查端点
    r.GET("/health", healthHandler.Health)

    // API 路由组
    api := r.Group("/api/v1")
    {
        // 用户路由
        users := api.Group("/users")
        {
            users.POST("/register", userHandler.Register)
            users.POST("/login", userHandler.Login)
            users.GET("/profile", middleware.AuthRequired(), userHandler.GetProfile)
            users.PUT("/profile", middleware.AuthRequired(), userHandler.UpdateProfile)
        }

        // AI 路由
        ai := api.Group("/ai")
        ai.Use(middleware.AuthRequired())
        {
            ai.POST("/chat", aiHandler.Chat)
            ai.POST("/generate", aiHandler.Generate)
            ai.GET("/models", aiHandler.GetModels)
        }
    }

    return r
}
```

## 路由和中间件

### 基本路由

```go
func main() {
    r := gin.Default()
    
    // GET 路由
    r.GET("/users", getUsers)
    
    // POST 路由
    r.POST("/users", createUser)
    
    // PUT 路由
    r.PUT("/users/:id", updateUser)
    
    // DELETE 路由
    r.DELETE("/users/:id", deleteUser)
    
    // 路径参数
    r.GET("/users/:id", func(c *gin.Context) {
        id := c.Param("id")
        c.JSON(200, gin.H{"user_id": id})
    })
    
    // 查询参数
    r.GET("/search", func(c *gin.Context) {
        query := c.Query("q")
        page := c.DefaultQuery("page", "1")
        c.JSON(200, gin.H{"query": query, "page": page})
    })
    
    r.Run(":8080")
}
```

### 路由组

```go
func main() {
    r := gin.Default()
    
    // 路由组
    v1 := r.Group("/api/v1")
    {
        v1.GET("/users", getUsers)
        v1.POST("/users", createUser)
        
        // 嵌套路由组
        admin := v1.Group("/admin")
        admin.Use(AdminMiddleware())
        {
            admin.GET("/stats", getStats)
            admin.DELETE("/users/:id", deleteUser)
        }
    }
    
    r.Run(":8080")
}
```

### 中间件

```go
// 自定义中间件
func LoggerMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        
        // 处理请求
        c.Next()
        
        // 记录日志
        latency := time.Since(start)
        status := c.Writer.Status()
        fmt.Printf("%s %s %d %v\n", c.Request.Method, c.Request.URL.Path, status, latency)
    }
}

// 认证中间件
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.JSON(401, gin.H{"error": "Unauthorized"})
            c.Abort()
            return
        }
        
        // 验证 token
        if !validateToken(token) {
            c.JSON(401, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }
        
        c.Next()
    }
}

// 使用中间件
func main() {
    r := gin.Default()
    
    // 全局中间件
    r.Use(LoggerMiddleware())
    
    // 路由组中间件
    auth := r.Group("/api")
    auth.Use(AuthMiddleware())
    {
        auth.GET("/profile", getProfile)
    }
    
    r.Run(":8080")
}
```

### 项目中的中间件实现

```go
// internal/middleware/middleware.go
func Logger() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        path := c.Request.URL.Path
        raw := c.Request.URL.RawQuery

        c.Next()

        latency := time.Since(start)
        statusCode := c.Writer.Status()
        clientIP := c.ClientIP()

        logrus.WithFields(logrus.Fields{
            "status_code": statusCode,
            "latency":     latency,
            "client_ip":   clientIP,
            "method":      c.Request.Method,
            "path":        path,
            "raw_query":   raw,
            "user_agent":  c.Request.UserAgent(),
        }).Info("Request processed")
    }
}

func CORS() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "*")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
        c.Header("Access-Control-Allow-Credentials", "true")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }

        c.Next()
    }
}
```

## 请求处理

### 绑定请求数据

```go
type User struct {
    Name  string `json:"name" binding:"required"`
    Email string `json:"email" binding:"required,email"`
    Age   int    `json:"age" binding:"gte=0,lte=130"`
}

func createUser(c *gin.Context) {
    var user User
    
    // 绑定 JSON 数据
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    // 处理用户数据
    c.JSON(201, gin.H{"message": "User created", "user": user})
}

// 绑定查询参数
type SearchQuery struct {
    Query string `form:"q" binding:"required"`
    Page  int    `form:"page" binding:"min=1"`
    Limit int    `form:"limit" binding:"min=1,max=100"`
}

func searchUsers(c *gin.Context) {
    var query SearchQuery
    
    if err := c.ShouldBindQuery(&query); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    // 处理搜索逻辑
    c.JSON(200, gin.H{"query": query})
}
```

### 项目中的请求处理

```go
// handlers/user.go
func (h *UserHandler) Register(c *gin.Context) {
    var req models.UserCreateRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        logrus.Error("Invalid request body:", err)
        response.Error(c, http.StatusBadRequest, "Invalid request body")
        return
    }

    user, err := h.userService.CreateUser(req)
    if err != nil {
        logrus.Error("Failed to create user:", err)
        response.Error(c, http.StatusInternalServerError, "Failed to create user")
        return
    }

    token, err := middleware.GenerateToken(user.ID, user.Username)
    if err != nil {
        logrus.Error("Failed to generate token:", err)
        response.Error(c, http.StatusInternalServerError, "Failed to generate token")
        return
    }

    data := gin.H{
        "user":  user.ToResponse(),
        "token": token,
    }

    response.Success(c, http.StatusCreated, "User registered successfully", data)
}
```

## 响应格式

### 基本响应

```go
func handler(c *gin.Context) {
    // JSON 响应
    c.JSON(200, gin.H{
        "message": "Success",
        "data":    someData,
    })
    
    // 字符串响应
    c.String(200, "Hello %s", "World")
    
    // HTML 响应
    c.HTML(200, "index.html", gin.H{
        "title": "Home Page",
    })
    
    // 重定向
    c.Redirect(302, "/login")
    
    // 文件响应
    c.File("./uploads/file.pdf")
    
    // 流式响应
    c.Stream(func(w io.Writer) bool {
        // 写入数据到 w
        return true // 返回 false 停止流式传输
    })
}
```

### 项目中的响应格式

```go
// pkg/response/response.go
type Response struct {
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
}

func Success(c *gin.Context, code int, message string, data interface{}) {
    c.JSON(code, Response{
        Code:    code,
        Message: message,
        Data:    data,
    })
}

func Error(c *gin.Context, code int, message string) {
    c.JSON(code, Response{
        Code:    code,
        Message: message,
    })
}

// 使用示例
func getUsers(c *gin.Context) {
    users, err := userService.GetUsers()
    if err != nil {
        response.Error(c, 500, "Failed to get users")
        return
    }
    
    response.Success(c, 200, "Users retrieved successfully", users)
}
```

## 错误处理

### 全局错误处理

```go
func ErrorHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Next()
        
        // 处理错误
        if len(c.Errors) > 0 {
            err := c.Errors.Last()
            
            switch err.Type {
            case gin.ErrorTypeBind:
                c.JSON(400, gin.H{"error": "Bad request"})
            case gin.ErrorTypePublic:
                c.JSON(500, gin.H{"error": err.Error()})
            default:
                c.JSON(500, gin.H{"error": "Internal server error"})
            }
        }
    }
}
```

### 恢复中间件

```go
// internal/middleware/middleware.go
func Recovery() gin.HandlerFunc {
    return func(c *gin.Context) {
        defer func() {
            if r := recover(); r != nil {
                logrus.WithFields(logrus.Fields{
                    "error": r,
                    "path":  c.Request.URL.Path,
                }).Error("Panic recovered")
                
                response.Error(c, http.StatusInternalServerError, "Internal server error")
                c.Abort()
            }
        }()
        c.Next()
    }
}
```

## 实战示例

### 完整的用户 API

```go
package main

import (
    "github.com/gin-gonic/gin"
    "net/http"
    "strconv"
)

type User struct {
    ID       int    `json:"id"`
    Username string `json:"username" binding:"required"`
    Email    string `json:"email" binding:"required,email"`
}

var users = []User{
    {ID: 1, Username: "alice", Email: "alice@example.com"},
    {ID: 2, Username: "bob", Email: "bob@example.com"},
}
var nextID = 3

func main() {
    r := gin.Default()
    
    api := r.Group("/api/v1")
    {
        api.GET("/users", getUsers)
        api.GET("/users/:id", getUserByID)
        api.POST("/users", createUser)
        api.PUT("/users/:id", updateUser)
        api.DELETE("/users/:id", deleteUser)
    }
    
    r.Run(":8080")
}

func getUsers(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{
        "users": users,
        "total": len(users),
    })
}

func getUserByID(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }
    
    for _, user := range users {
        if user.ID == id {
            c.JSON(http.StatusOK, user)
            return
        }
    }
    
    c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
}

func createUser(c *gin.Context) {
    var newUser User
    if err := c.ShouldBindJSON(&newUser); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    newUser.ID = nextID
    nextID++
    users = append(users, newUser)
    
    c.JSON(http.StatusCreated, newUser)
}

func updateUser(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }
    
    var updatedUser User
    if err := c.ShouldBindJSON(&updatedUser); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    for i, user := range users {
        if user.ID == id {
            updatedUser.ID = id
            users[i] = updatedUser
            c.JSON(http.StatusOK, updatedUser)
            return
        }
    }
    
    c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
}

func deleteUser(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }
    
    for i, user := range users {
        if user.ID == id {
            users = append(users[:i], users[i+1:]...)
            c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
            return
        }
    }
    
    c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
}
```

### 文件上传处理

```go
func uploadFile(c *gin.Context) {
    // 单文件上传
    file, err := c.FormFile("file")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    // 保存文件
    filename := filepath.Join("uploads", file.Filename)
    if err := c.SaveUploadedFile(file, filename); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "message":  "File uploaded successfully",
        "filename": file.Filename,
        "size":     file.Size,
    })
}

func uploadMultipleFiles(c *gin.Context) {
    // 多文件上传
    form, err := c.MultipartForm()
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    files := form.File["files"]
    for _, file := range files {
        filename := filepath.Join("uploads", file.Filename)
        if err := c.SaveUploadedFile(file, filename); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
    }
    
    c.JSON(http.StatusOK, gin.H{
        "message": "Files uploaded successfully",
        "count":   len(files),
    })
}
```

## 总结

Go Web 开发的核心要点：

1. **HTTP 基础**：理解 HTTP 协议和原生 HTTP 服务器
2. **Gin 框架**：现代、快速的 Web 框架
3. **路由和中间件**：灵活的路由系统和中间件机制
4. **请求处理**：数据绑定和验证
5. **响应格式**：统一的 API 响应格式
6. **错误处理**：优雅的错误处理机制

掌握这些概念后，你就能构建强大的 Web API 服务了。下一章我们将学习数据库操作。