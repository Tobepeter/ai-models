# Go 数据结构详解

## 目录
- [切片（Slices）](#切片slices)
- [映射（Maps）](#映射maps)
- [结构体（Structs）](#结构体structs)
- [接口（Interfaces）](#接口interfaces)
- [通道（Channels）](#通道channels)

## 切片（Slices）

切片是 Go 中最常用的数据结构之一，它是对数组的抽象，提供了动态数组的功能。

### 创建切片

```go
// 方式1：声明切片
var numbers []int

// 方式2：使用 make 创建切片
numbers = make([]int, 5)        // 长度为5，容量为5
numbers = make([]int, 5, 10)    // 长度为5，容量为10

// 方式3：字面量创建
numbers = []int{1, 2, 3, 4, 5}

// 方式4：从数组创建切片
arr := [5]int{1, 2, 3, 4, 5}
slice := arr[1:4]  // 创建包含 arr[1], arr[2], arr[3] 的切片
```

### 切片操作

```go
// 添加元素
numbers = append(numbers, 6)
numbers = append(numbers, 7, 8, 9)

// 切片长度和容量
fmt.Println("长度:", len(numbers))
fmt.Println("容量:", cap(numbers))

// 切片截取
subSlice := numbers[1:4]    // 包含索引 1, 2, 3
subSlice = numbers[:3]      // 包含索引 0, 1, 2
subSlice = numbers[2:]      // 从索引 2 到末尾
subSlice = numbers[:]       // 完整切片

// 复制切片
source := []int{1, 2, 3}
destination := make([]int, len(source))
copy(destination, source)
```

### 项目中的实际使用

```go
// services/ai.go 中的切片使用
func (s *AIService) GetAvailableModels() ([]models.AIModel, error) {
    models := []models.AIModel{
        {
            ID:          "gpt-3.5-turbo",
            Name:        "GPT-3.5 Turbo",
            Description: "Fast and efficient language model",
            Provider:    "OpenAI",
            Capabilities: []string{"text-generation", "chat", "code-generation"},
            MaxTokens:   4096,
            IsActive:    true,
        },
        // 更多模型...
    }
    return models, nil
}

// handlers/user.go 中的切片操作
func (h *UserHandler) GetUsers(c *gin.Context) {
    users, total, err := h.userService.GetUsers(page, limit)
    if err != nil {
        response.Error(c, http.StatusInternalServerError, "Failed to get users")
        return
    }
    
    // users 是 []models.UserResponse 类型的切片
    data := gin.H{
        "users": users,
        "pagination": gin.H{
            "total": total,
        },
    }
    response.Success(c, http.StatusOK, "Users retrieved successfully", data)
}
```

## 映射（Maps）

映射是键值对的集合，类似于其他语言中的哈希表或字典。

### 创建映射

```go
// 方式1：声明映射
var ages map[string]int

// 方式2：使用 make 创建映射
ages = make(map[string]int)

// 方式3：字面量创建
ages = map[string]int{
    "Alice": 25,
    "Bob":   30,
    "Charlie": 35,
}
```

### 映射操作

```go
// 添加或更新键值对
ages["Dave"] = 28

// 获取值
age := ages["Alice"]

// 检查键是否存在
age, exists := ages["Alice"]
if exists {
    fmt.Printf("Alice is %d years old\n", age)
}

// 删除键值对
delete(ages, "Bob")

// 遍历映射
for name, age := range ages {
    fmt.Printf("%s is %d years old\n", name, age)
}

// 获取映射长度
fmt.Println("映射长度:", len(ages))
```

### 项目中的实际使用

```go
// models/ai.go 中的映射使用
type GenerateRequest struct {
    Prompt     string            `json:"prompt" binding:"required"`
    Model      string            `json:"model,omitempty"`
    Parameters map[string]interface{} `json:"parameters,omitempty"`
}

// pkg/response/response.go 中的映射
func ValidationError(c *gin.Context, errors map[string]string) {
    c.JSON(400, Response{
        Code:    400,
        Message: "Validation failed",
        Data:    errors,
    })
}

// 使用示例
validationErrors := map[string]string{
    "username": "用户名不能为空",
    "email":    "邮箱格式不正确",
}
response.ValidationError(c, validationErrors)
```

## 结构体（Structs）

结构体是将相关数据组合在一起的类型。

### 定义结构体

```go
// 基本结构体
type Person struct {
    Name string
    Age  int
    Email string
}

// 嵌套结构体
type Address struct {
    Street   string
    City     string
    Country  string
    ZipCode  string
}

type Employee struct {
    Person          // 嵌入结构体
    ID       int
    Position string
    Address  Address  // 嵌套结构体
}
```

### 创建和使用结构体

```go
// 创建结构体实例
// 方式1：字面量
person := Person{
    Name:  "Alice",
    Age:   25,
    Email: "alice@example.com",
}

// 方式2：使用字段名
person = Person{
    Name: "Bob",
    Age:  30,
}

// 方式3：按顺序（不推荐）
person = Person{"Charlie", 35, "charlie@example.com"}

// 方式4：使用 new（返回指针）
personPtr := new(Person)
personPtr.Name = "Dave"

// 方式5：获取地址
personPtr = &Person{Name: "Eve", Age: 28}
```

### 结构体方法

```go
// 值接收者方法
func (p Person) GetFullInfo() string {
    return fmt.Sprintf("Name: %s, Age: %d, Email: %s", p.Name, p.Age, p.Email)
}

// 指针接收者方法
func (p *Person) UpdateAge(newAge int) {
    p.Age = newAge
}

// 使用方法
person := Person{Name: "Alice", Age: 25}
fmt.Println(person.GetFullInfo())
person.UpdateAge(26)
```

### 项目中的实际使用

```go
// models/user.go 中的结构体定义
type User struct {
    ID        uint           `json:"id" gorm:"primaryKey"`
    Username  string         `json:"username" gorm:"uniqueIndex;not null"`
    Email     string         `json:"email" gorm:"uniqueIndex;not null"`
    Password  string         `json:"-" gorm:"not null"`
    Avatar    string         `json:"avatar,omitempty"`
    IsActive  bool           `json:"is_active" gorm:"default:true"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// 结构体方法
func (u *User) ToResponse() UserResponse {
    return UserResponse{
        ID:        u.ID,
        Username:  u.Username,
        Email:     u.Email,
        Avatar:    u.Avatar,
        IsActive:  u.IsActive,
        CreatedAt: u.CreatedAt,
        UpdatedAt: u.UpdatedAt,
    }
}

// 结构体标签的使用
type UserCreateRequest struct {
    Username string `json:"username" binding:"required,min=3,max=50"`
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6"`
}
```

## 接口（Interfaces）

接口定义了类型应该实现的方法集合。

### 定义接口

```go
// 基本接口
type Shape interface {
    Area() float64
    Perimeter() float64
}

// 多个接口
type Reader interface {
    Read([]byte) (int, error)
}

type Writer interface {
    Write([]byte) (int, error)
}

type ReadWriter interface {
    Reader
    Writer
}
```

### 实现接口

```go
// 实现 Shape 接口
type Rectangle struct {
    Width  float64
    Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
    return 2 * (r.Width + r.Height)
}

type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return 3.14159 * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
    return 2 * 3.14159 * c.Radius
}

// 使用接口
func PrintShapeInfo(s Shape) {
    fmt.Printf("Area: %.2f, Perimeter: %.2f\n", s.Area(), s.Perimeter())
}

func main() {
    rect := Rectangle{Width: 5, Height: 3}
    circle := Circle{Radius: 2}
    
    PrintShapeInfo(rect)
    PrintShapeInfo(circle)
}
```

### 空接口和类型断言

```go
// 空接口可以存储任何类型的值
var value interface{}
value = 42
value = "hello"
value = []int{1, 2, 3}

// 类型断言
func processValue(value interface{}) {
    switch v := value.(type) {
    case int:
        fmt.Printf("Integer: %d\n", v)
    case string:
        fmt.Printf("String: %s\n", v)
    case []int:
        fmt.Printf("Int slice: %v\n", v)
    default:
        fmt.Printf("Unknown type: %T\n", v)
    }
}

// 安全的类型断言
if str, ok := value.(string); ok {
    fmt.Printf("String value: %s\n", str)
}
```

## 通道（Channels）

通道是 Go 中用于 goroutines 之间通信的机制。

### 创建通道

```go
// 创建通道
ch := make(chan int)        // 无缓冲通道
ch = make(chan int, 10)     // 有缓冲通道

// 只读通道
var readOnly <-chan int = ch

// 只写通道
var writeOnly chan<- int = ch
```

### 通道操作

```go
// 发送数据
ch <- 42

// 接收数据
value := <-ch

// 接收数据并检查通道是否关闭
value, ok := <-ch
if !ok {
    fmt.Println("通道已关闭")
}

// 关闭通道
close(ch)

// 使用 range 遍历通道
for value := range ch {
    fmt.Println(value)
}
```

### 项目中的实际使用

```go
// handlers/ai.go 中的通道使用
func (h *AIHandler) handleStreamingChat(c *gin.Context, userID uint, req models.ChatRequest) {
    // 创建通道用于流式响应
    responseChan := make(chan string, 100)
    errChan := make(chan error, 1)

    // 在 goroutine 中开始流式处理
    go func() {
        defer close(responseChan)
        defer close(errChan)
        
        err := h.aiService.StreamChat(userID, req, responseChan)
        if err != nil {
            errChan <- err
        }
    }()

    // 发送流式响应
    for {
        select {
        case chunk, ok := <-responseChan:
            if !ok {
                c.SSEvent("done", "")
                return
            }
            c.SSEvent("data", chunk)
            c.Writer.Flush()
        case err := <-errChan:
            if err != nil {
                c.SSEvent("error", err.Error())
                return
            }
        }
    }
}
```

## 实战练习

### 练习1：实现一个简单的缓存系统

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

// 缓存项
type CacheItem struct {
    Value      interface{}
    Expiration time.Time
}

// 缓存系统
type Cache struct {
    items map[string]CacheItem
    mutex sync.RWMutex
}

// 创建新的缓存
func NewCache() *Cache {
    return &Cache{
        items: make(map[string]CacheItem),
    }
}

// 设置缓存项
func (c *Cache) Set(key string, value interface{}, duration time.Duration) {
    c.mutex.Lock()
    defer c.mutex.Unlock()
    
    expiration := time.Now().Add(duration)
    c.items[key] = CacheItem{
        Value:      value,
        Expiration: expiration,
    }
}

// 获取缓存项
func (c *Cache) Get(key string) (interface{}, bool) {
    c.mutex.RLock()
    defer c.mutex.RUnlock()
    
    item, exists := c.items[key]
    if !exists {
        return nil, false
    }
    
    // 检查是否过期
    if time.Now().After(item.Expiration) {
        delete(c.items, key)
        return nil, false
    }
    
    return item.Value, true
}

// 删除缓存项
func (c *Cache) Delete(key string) {
    c.mutex.Lock()
    defer c.mutex.Unlock()
    
    delete(c.items, key)
}

// 清理过期项
func (c *Cache) CleanExpired() {
    c.mutex.Lock()
    defer c.mutex.Unlock()
    
    now := time.Now()
    for key, item := range c.items {
        if now.After(item.Expiration) {
            delete(c.items, key)
        }
    }
}

func main() {
    cache := NewCache()
    
    // 设置缓存项
    cache.Set("user:1", "Alice", 5*time.Second)
    cache.Set("user:2", "Bob", 10*time.Second)
    
    // 获取缓存项
    if value, exists := cache.Get("user:1"); exists {
        fmt.Printf("Found: %s\n", value)
    }
    
    // 等待缓存过期
    time.Sleep(6 * time.Second)
    
    if value, exists := cache.Get("user:1"); exists {
        fmt.Printf("Found: %s\n", value)
    } else {
        fmt.Println("Cache expired")
    }
}
```

### 练习2：实现一个工作池

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

// 工作任务
type Job struct {
    ID   int
    Data string
}

// 工作结果
type Result struct {
    Job    Job
    Output string
}

// 工作池
type WorkerPool struct {
    workerCount int
    jobs        chan Job
    results     chan Result
    wg          sync.WaitGroup
}

// 创建工作池
func NewWorkerPool(workerCount int) *WorkerPool {
    return &WorkerPool{
        workerCount: workerCount,
        jobs:        make(chan Job, 100),
        results:     make(chan Result, 100),
    }
}

// 工作函数
func (wp *WorkerPool) worker(id int) {
    defer wp.wg.Done()
    
    for job := range wp.jobs {
        // 模拟工作
        time.Sleep(time.Second)
        result := Result{
            Job:    job,
            Output: fmt.Sprintf("Worker %d processed job %d: %s", id, job.ID, job.Data),
        }
        wp.results <- result
    }
}

// 启动工作池
func (wp *WorkerPool) Start() {
    for i := 0; i < wp.workerCount; i++ {
        wp.wg.Add(1)
        go wp.worker(i)
    }
}

// 提交任务
func (wp *WorkerPool) Submit(job Job) {
    wp.jobs <- job
}

// 获取结果
func (wp *WorkerPool) GetResult() Result {
    return <-wp.results
}

// 关闭工作池
func (wp *WorkerPool) Close() {
    close(wp.jobs)
    wp.wg.Wait()
    close(wp.results)
}

func main() {
    // 创建工作池
    pool := NewWorkerPool(3)
    pool.Start()
    
    // 提交任务
    for i := 0; i < 5; i++ {
        job := Job{
            ID:   i,
            Data: fmt.Sprintf("task-%d", i),
        }
        pool.Submit(job)
    }
    
    // 获取结果
    go func() {
        for i := 0; i < 5; i++ {
            result := pool.GetResult()
            fmt.Println(result.Output)
        }
    }()
    
    // 等待所有任务完成
    time.Sleep(6 * time.Second)
    pool.Close()
}
```

## 总结

本章详细介绍了 Go 语言的主要数据结构：

1. **切片（Slices）**：动态数组，灵活且高效
2. **映射（Maps）**：键值对集合，用于快速查找
3. **结构体（Structs）**：组合数据类型，Go 面向对象编程的基础
4. **接口（Interfaces）**：定义行为契约，实现多态
5. **通道（Channels）**：goroutines 间的通信机制

这些数据结构是 Go 编程的核心，掌握它们的使用方法对于编写高效的 Go 程序至关重要。在下一章中，我们将学习 Go 的并发编程特性。