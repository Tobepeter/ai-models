# Go 语言基础

## 目录
- [变量和常量](#变量和常量)
- [数据类型](#数据类型)
- [函数](#函数)
- [控制流程](#控制流程)
- [指针](#指针)
- [包和导入](#包和导入)

## 变量和常量

### 变量声明

```go
// 方式1：声明并初始化
var name string = "Alice"
var age int = 25

// 方式2：类型推断
var name = "Alice"
var age = 25

// 方式3：简短声明（只能在函数内部使用）
name := "Alice"
age := 25

// 方式4：多变量声明
var (
    name string = "Alice"
    age  int    = 25
)
```

### 常量

```go
// 单个常量
const pi = 3.14159

// 多个常量
const (
    StatusOK = 200
    StatusNotFound = 404
    StatusInternalError = 500
)

// 枚举类型
const (
    Monday = iota  // 0
    Tuesday        // 1
    Wednesday      // 2
    Thursday       // 3
    Friday         // 4
    Saturday       // 5
    Sunday         // 6
)
```

### 实际应用示例

```go
// 在我们的项目中，config/config.go 中使用了变量
func New() *Config {
    return &Config{
        Port:        getEnv("PORT", "8080"),        // 默认端口
        Environment: getEnv("ENVIRONMENT", "development"),
        DBHost:      getEnv("DB_HOST", "localhost"),
    }
}

// 在 handlers 中使用常量
const (
    UserRoleAdmin = "admin"
    UserRoleUser  = "user"
)
```

## 数据类型

### 基本类型

```go
// 布尔型
var isActive bool = true

// 数值类型
var age int = 25
var price float64 = 19.99
var count int32 = 1000

// 字符串
var name string = "Hello, World!"

// 字符（rune 实际上是 int32 的别名）
var ch rune = 'A'

// 字节
var b byte = 255
```

### 复合类型

```go
// 数组（固定长度）
var scores [5]int = [5]int{90, 85, 78, 92, 88}

// 切片（动态数组）
var names []string = []string{"Alice", "Bob", "Charlie"}
names = append(names, "Dave")  // 添加元素

// 映射（类似于哈希表）
var ages map[string]int = map[string]int{
    "Alice": 25,
    "Bob":   30,
}
ages["Charlie"] = 35  // 添加键值对

// 结构体
type Person struct {
    Name string
    Age  int
    Email string
}

var person Person = Person{
    Name:  "Alice",
    Age:   25,
    Email: "alice@example.com",
}
```

### 项目中的实际使用

```go
// models/user.go 中的结构体
type User struct {
    ID        uint           `json:"id" gorm:"primaryKey"`
    Username  string         `json:"username" gorm:"uniqueIndex;not null"`
    Email     string         `json:"email" gorm:"uniqueIndex;not null"`
    Password  string         `json:"-" gorm:"not null"`
    IsActive  bool           `json:"is_active" gorm:"default:true"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
}

// models/ai.go 中的映射使用
type GenerateRequest struct {
    Prompt     string            `json:"prompt" binding:"required"`
    Model      string            `json:"model,omitempty"`
    Parameters map[string]interface{} `json:"parameters,omitempty"`
}
```

## 函数

### 基本函数

```go
// 基本函数
func greet(name string) string {
    return "Hello, " + name + "!"
}

// 多参数函数
func add(a, b int) int {
    return a + b
}

// 多返回值函数
func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

// 命名返回值
func calculate(a, b int) (sum, product int) {
    sum = a + b
    product = a * b
    return  // 自动返回 sum 和 product
}
```

### 方法（Methods）

```go
// 为结构体定义方法
type Rectangle struct {
    Width  float64
    Height float64
}

// 值接收者方法
func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

// 指针接收者方法
func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}
```

### 项目中的实际使用

```go
// handlers/user.go 中的方法定义
func (h *UserHandler) Register(c *gin.Context) {
    var req models.UserCreateRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        response.Error(c, http.StatusBadRequest, "Invalid request body")
        return
    }
    // 处理注册逻辑...
}

// models/user.go 中的方法
func (u *User) ToResponse() UserResponse {
    return UserResponse{
        ID:        u.ID,
        Username:  u.Username,
        Email:     u.Email,
        // ...
    }
}
```

## 控制流程

### 条件语句

```go
// if-else 语句
age := 18
if age >= 18 {
    fmt.Println("Adult")
} else if age >= 13 {
    fmt.Println("Teenager")
} else {
    fmt.Println("Child")
}

// if 语句中的简短声明
if err := validateUser(user); err != nil {
    return err
}

// switch 语句
grade := 'B'
switch grade {
case 'A':
    fmt.Println("Excellent")
case 'B':
    fmt.Println("Good")
case 'C':
    fmt.Println("Fair")
default:
    fmt.Println("Poor")
}

// 类型 switch
func processValue(value interface{}) {
    switch v := value.(type) {
    case int:
        fmt.Printf("Integer: %d\n", v)
    case string:
        fmt.Printf("String: %s\n", v)
    case bool:
        fmt.Printf("Boolean: %t\n", v)
    default:
        fmt.Printf("Unknown type: %T\n", v)
    }
}
```

### 循环语句

```go
// for 循环的三种形式

// 1. 传统 for 循环
for i := 0; i < 10; i++ {
    fmt.Println(i)
}

// 2. while 循环的等价形式
i := 0
for i < 10 {
    fmt.Println(i)
    i++
}

// 3. 无限循环
for {
    // 做某些事情
    if condition {
        break
    }
}

// range 循环
// 遍历切片
names := []string{"Alice", "Bob", "Charlie"}
for index, name := range names {
    fmt.Printf("Index: %d, Name: %s\n", index, name)
}

// 遍历映射
ages := map[string]int{"Alice": 25, "Bob": 30}
for name, age := range ages {
    fmt.Printf("Name: %s, Age: %d\n", name, age)
}

// 只要值，不要索引
for _, name := range names {
    fmt.Println(name)
}
```

### 项目中的实际使用

```go
// middleware/auth.go 中的条件判断
func AuthRequired() gin.HandlerFunc {
    return func(c *gin.Context) {
        token, err := extractToken(c)
        if err != nil {
            response.Error(c, http.StatusUnauthorized, "Authentication required")
            c.Abort()
            return
        }
        // 处理认证逻辑...
    }
}

// services/ai.go 中的 range 循环
func (s *AIService) StreamChat(userID uint, req models.ChatRequest, responseChan chan<- string) error {
    mockResponse := s.generateMockResponse(req.Message)
    words := strings.Fields(mockResponse)
    
    for _, word := range words {
        select {
        case responseChan <- word + " ":
            time.Sleep(50 * time.Millisecond)
        default:
            return fmt.Errorf("channel closed")
        }
    }
    return nil
}
```

## 指针

### 基本概念

```go
// 声明指针
var p *int

// 获取变量的地址
x := 42
p = &x

// 通过指针访问值
fmt.Println(*p)  // 输出: 42

// 通过指针修改值
*p = 100
fmt.Println(x)   // 输出: 100
```

### 结构体指针

```go
type Person struct {
    Name string
    Age  int
}

// 创建结构体指针
p := &Person{Name: "Alice", Age: 25}

// 访问结构体字段（Go 自动解引用）
fmt.Println(p.Name)  // 等价于 (*p).Name

// 修改结构体字段
p.Age = 26
```

### 项目中的实际使用

```go
// handlers/user.go 中的指针接收者
func NewUserHandler(userService *services.UserService) *UserHandler {
    return &UserHandler{
        userService: userService,
    }
}

// middleware/auth.go 中的指针方法
func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}
```

## 包和导入

### 包的定义

```go
// 在文件开头声明包名
package main

// 导入其他包
import (
    "fmt"
    "net/http"
    "github.com/gin-gonic/gin"
)

// 或者单独导入
import "fmt"
import "net/http"
```

### 包的可见性

```go
// 大写字母开头的标识符是公开的（exported）
func PublicFunction() {
    // 可以被其他包访问
}

// 小写字母开头的标识符是私有的（unexported）
func privateFunction() {
    // 只能在当前包内访问
}

type User struct {
    Name  string  // 公开字段
    email string  // 私有字段
}
```

### 项目中的实际使用

```go
// cmd/main.go 中的导入
import (
    "ai-models-backend/internal/config"
    "ai-models-backend/internal/handlers"
    "ai-models-backend/internal/middleware"
    "ai-models-backend/pkg/response"
    
    "github.com/gin-gonic/gin"
    "github.com/sirupsen/logrus"
)

// 使用导入的包
cfg := config.New()
userHandler := handlers.NewUserHandler(userService)
```

## 练习题

### 练习1：创建一个简单的计算器

```go
package main

import "fmt"

func calculator(a, b float64, operation string) (float64, error) {
    switch operation {
    case "+":
        return a + b, nil
    case "-":
        return a - b, nil
    case "*":
        return a * b, nil
    case "/":
        if b == 0 {
            return 0, fmt.Errorf("division by zero")
        }
        return a / b, nil
    default:
        return 0, fmt.Errorf("unknown operation: %s", operation)
    }
}

func main() {
    result, err := calculator(10, 5, "+")
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    fmt.Printf("Result: %.2f\n", result)
}
```

### 练习2：实现一个简单的用户管理系统

```go
package main

import (
    "fmt"
    "time"
)

type User struct {
    ID       int
    Username string
    Email    string
    Created  time.Time
}

type UserManager struct {
    users []User
    nextID int
}

func NewUserManager() *UserManager {
    return &UserManager{
        users:  make([]User, 0),
        nextID: 1,
    }
}

func (um *UserManager) CreateUser(username, email string) User {
    user := User{
        ID:       um.nextID,
        Username: username,
        Email:    email,
        Created:  time.Now(),
    }
    um.users = append(um.users, user)
    um.nextID++
    return user
}

func (um *UserManager) GetUser(id int) (*User, bool) {
    for _, user := range um.users {
        if user.ID == id {
            return &user, true
        }
    }
    return nil, false
}

func (um *UserManager) ListUsers() []User {
    return um.users
}

func main() {
    manager := NewUserManager()
    
    // 创建用户
    user1 := manager.CreateUser("alice", "alice@example.com")
    user2 := manager.CreateUser("bob", "bob@example.com")
    
    fmt.Printf("Created users: %+v, %+v\n", user1, user2)
    
    // 获取用户
    if user, found := manager.GetUser(1); found {
        fmt.Printf("Found user: %+v\n", *user)
    }
    
    // 列出所有用户
    fmt.Println("All users:")
    for _, user := range manager.ListUsers() {
        fmt.Printf("- %+v\n", user)
    }
}
```

## 总结

这一章涵盖了 Go 语言的基础知识：

1. **变量和常量**：了解如何声明和使用变量
2. **数据类型**：掌握 Go 的基本和复合类型
3. **函数**：学会定义和使用函数和方法
4. **控制流程**：掌握条件语句和循环
5. **指针**：理解指针的概念和使用
6. **包和导入**：了解如何组织代码

下一章将深入学习 Go 的数据结构，包括切片、映射和结构体的高级用法。