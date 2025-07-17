# Go 并发编程

## 目录
- [Goroutines 基础](#goroutines-基础)
- [Channels 详解](#channels-详解)
- [Select 语句](#select-语句)
- [同步原语](#同步原语)
- [并发模式](#并发模式)
- [实战案例](#实战案例)

## Goroutines 基础

Goroutine 是 Go 语言的轻量级线程，由 Go 运行时管理。

### 创建 Goroutine

```go
package main

import (
    "fmt"
    "time"
)

func sayHello(name string) {
    for i := 0; i < 5; i++ {
        fmt.Printf("Hello %s - %d\n", name, i)
        time.Sleep(time.Millisecond * 100)
    }
}

func main() {
    // 启动 goroutine
    go sayHello("Alice")
    go sayHello("Bob")
    
    // 主 goroutine 等待
    time.Sleep(time.Second)
    fmt.Println("Main function ends")
}
```

### 匿名函数 Goroutine

```go
func main() {
    // 使用匿名函数创建 goroutine
    go func() {
        fmt.Println("Anonymous goroutine")
    }()
    
    // 带参数的匿名函数
    go func(name string) {
        fmt.Printf("Hello %s from anonymous goroutine\n", name)
    }("Alice")
    
    time.Sleep(time.Second)
}
```

### 项目中的实际使用

```go
// handlers/ai.go 中的 goroutine 使用
func (h *AIHandler) handleStreamingChat(c *gin.Context, userID uint, req models.ChatRequest) {
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

    // 主 goroutine 处理响应
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

## Channels 详解

Channel 是 goroutines 之间通信的管道。

### 无缓冲通道

```go
func main() {
    ch := make(chan int)
    
    // 发送者 goroutine
    go func() {
        ch <- 42
        fmt.Println("Sent 42")
    }()
    
    // 接收者
    value := <-ch
    fmt.Printf("Received: %d\n", value)
}
```

### 有缓冲通道

```go
func main() {
    ch := make(chan int, 3)  // 缓冲区大小为 3
    
    // 可以发送多个值而不阻塞
    ch <- 1
    ch <- 2
    ch <- 3
    
    // 接收值
    fmt.Println(<-ch)  // 1
    fmt.Println(<-ch)  // 2
    fmt.Println(<-ch)  // 3
}
```

### 通道方向

```go
// 只发送通道
func sender(ch chan<- int) {
    for i := 0; i < 5; i++ {
        ch <- i
    }
    close(ch)
}

// 只接收通道
func receiver(ch <-chan int) {
    for value := range ch {
        fmt.Printf("Received: %d\n", value)
    }
}

func main() {
    ch := make(chan int)
    
    go sender(ch)
    receiver(ch)
}
```

### 通道关闭

```go
func producer(ch chan<- int) {
    for i := 0; i < 5; i++ {
        ch <- i
    }
    close(ch)  // 关闭通道
}

func consumer(ch <-chan int) {
    // 方式1：使用 range（推荐）
    for value := range ch {
        fmt.Printf("Received: %d\n", value)
    }
    
    // 方式2：检查通道是否关闭
    /*
    for {
        value, ok := <-ch
        if !ok {
            break  // 通道已关闭
        }
        fmt.Printf("Received: %d\n", value)
    }
    */
}
```

## Select 语句

Select 语句用于处理多个通道操作。

### 基本用法

```go
func main() {
    ch1 := make(chan string)
    ch2 := make(chan string)
    
    go func() {
        time.Sleep(time.Second)
        ch1 <- "message from ch1"
    }()
    
    go func() {
        time.Sleep(2 * time.Second)
        ch2 <- "message from ch2"
    }()
    
    // 选择第一个准备好的通道
    select {
    case msg1 := <-ch1:
        fmt.Println(msg1)
    case msg2 := <-ch2:
        fmt.Println(msg2)
    }
}
```

### 带超时的 Select

```go
func main() {
    ch := make(chan string)
    
    go func() {
        time.Sleep(3 * time.Second)
        ch <- "delayed message"
    }()
    
    select {
    case msg := <-ch:
        fmt.Println(msg)
    case <-time.After(2 * time.Second):
        fmt.Println("Timeout!")
    }
}
```

### 非阻塞选择

```go
func main() {
    ch := make(chan string)
    
    select {
    case msg := <-ch:
        fmt.Println(msg)
    default:
        fmt.Println("No message available")
    }
}
```

### 项目中的实际使用

```go
// services/ai.go 中的 select 使用
func (s *AIService) StreamChat(userID uint, req models.ChatRequest, responseChan chan<- string) error {
    mockResponse := s.generateMockResponse(req.Message)
    words := strings.Fields(mockResponse)
    
    for _, word := range words {
        select {
        case responseChan <- word + " ":
            time.Sleep(50 * time.Millisecond)
        default:
            // 通道已满或已关闭
            return fmt.Errorf("channel closed")
        }
    }
    return nil
}
```

## 同步原语

### Mutex（互斥锁）

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

type Counter struct {
    mu    sync.Mutex
    value int
}

func (c *Counter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.value++
}

func (c *Counter) GetValue() int {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.value
}

func main() {
    counter := &Counter{}
    
    // 启动多个 goroutine
    var wg sync.WaitGroup
    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            counter.Increment()
        }()
    }
    
    wg.Wait()
    fmt.Printf("Final value: %d\n", counter.GetValue())
}
```

### RWMutex（读写锁）

```go
type SafeMap struct {
    mu   sync.RWMutex
    data map[string]int
}

func NewSafeMap() *SafeMap {
    return &SafeMap{
        data: make(map[string]int),
    }
}

func (sm *SafeMap) Set(key string, value int) {
    sm.mu.Lock()
    defer sm.mu.Unlock()
    sm.data[key] = value
}

func (sm *SafeMap) Get(key string) (int, bool) {
    sm.mu.RLock()
    defer sm.mu.RUnlock()
    value, exists := sm.data[key]
    return value, exists
}
```

### WaitGroup

```go
func main() {
    var wg sync.WaitGroup
    
    for i := 0; i < 3; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            fmt.Printf("Worker %d starting\n", id)
            time.Sleep(time.Second)
            fmt.Printf("Worker %d done\n", id)
        }(i)
    }
    
    wg.Wait()
    fmt.Println("All workers done")
}
```

### Once

```go
package main

import (
    "fmt"
    "sync"
)

var instance *Singleton
var once sync.Once

type Singleton struct {
    value string
}

func GetInstance() *Singleton {
    once.Do(func() {
        instance = &Singleton{value: "singleton"}
    })
    return instance
}

func main() {
    var wg sync.WaitGroup
    
    for i := 0; i < 10; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            s := GetInstance()
            fmt.Printf("Goroutine %d: %s\n", id, s.value)
        }(i)
    }
    
    wg.Wait()
}
```

## 并发模式

### 生产者-消费者模式

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

// 生产者
func producer(ch chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    defer close(ch)
    
    for i := 0; i < 10; i++ {
        ch <- i
        fmt.Printf("Produced: %d\n", i)
        time.Sleep(time.Millisecond * 100)
    }
}

// 消费者
func consumer(ch <-chan int, wg *sync.WaitGroup) {
    defer wg.Done()
    
    for value := range ch {
        fmt.Printf("Consumed: %d\n", value)
        time.Sleep(time.Millisecond * 150)
    }
}

func main() {
    ch := make(chan int, 5)
    var wg sync.WaitGroup
    
    wg.Add(2)
    go producer(ch, &wg)
    go consumer(ch, &wg)
    
    wg.Wait()
}
```

### 工作池模式

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

type Job struct {
    ID   int
    Data string
}

type Result struct {
    Job    Job
    Output string
}

func worker(id int, jobs <-chan Job, results chan<- Result) {
    for job := range jobs {
        // 模拟工作
        time.Sleep(time.Second)
        result := Result{
            Job:    job,
            Output: fmt.Sprintf("Worker %d processed job %d", id, job.ID),
        }
        results <- result
    }
}

func main() {
    const numWorkers = 3
    const numJobs = 5
    
    jobs := make(chan Job, numJobs)
    results := make(chan Result, numJobs)
    
    // 启动工作者
    for w := 1; w <= numWorkers; w++ {
        go worker(w, jobs, results)
    }
    
    // 发送任务
    for j := 1; j <= numJobs; j++ {
        jobs <- Job{ID: j, Data: fmt.Sprintf("task-%d", j)}
    }
    close(jobs)
    
    // 收集结果
    for r := 1; r <= numJobs; r++ {
        result := <-results
        fmt.Println(result.Output)
    }
}
```

### 扇出/扇入模式

```go
package main

import (
    "fmt"
    "sync"
)

// 扇出：将输入分发到多个 goroutine
func fanOut(input <-chan int, workers int) []<-chan int {
    outputs := make([]<-chan int, workers)
    
    for i := 0; i < workers; i++ {
        output := make(chan int)
        outputs[i] = output
        
        go func(out chan<- int) {
            defer close(out)
            for value := range input {
                out <- value * value  // 计算平方
            }
        }(output)
    }
    
    return outputs
}

// 扇入：将多个 goroutine 的输出合并
func fanIn(inputs []<-chan int) <-chan int {
    output := make(chan int)
    var wg sync.WaitGroup
    
    for _, input := range inputs {
        wg.Add(1)
        go func(in <-chan int) {
            defer wg.Done()
            for value := range in {
                output <- value
            }
        }(input)
    }
    
    go func() {
        wg.Wait()
        close(output)
    }()
    
    return output
}

func main() {
    // 创建输入通道
    input := make(chan int, 5)
    
    // 发送数据
    go func() {
        defer close(input)
        for i := 1; i <= 10; i++ {
            input <- i
        }
    }()
    
    // 扇出到 3 个工作者
    outputs := fanOut(input, 3)
    
    // 扇入合并结果
    result := fanIn(outputs)
    
    // 收集结果
    for value := range result {
        fmt.Printf("Result: %d\n", value)
    }
}
```

## 实战案例

### 并发网络爬虫

```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
    "sync"
    "time"
)

type URLResult struct {
    URL    string
    Status int
    Size   int
    Error  error
}

func fetchURL(url string, results chan<- URLResult) {
    resp, err := http.Get(url)
    if err != nil {
        results <- URLResult{URL: url, Error: err}
        return
    }
    defer resp.Body.Close()
    
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        results <- URLResult{URL: url, Status: resp.StatusCode, Error: err}
        return
    }
    
    results <- URLResult{
        URL:    url,
        Status: resp.StatusCode,
        Size:   len(body),
    }
}

func main() {
    urls := []string{
        "https://httpbin.org/delay/1",
        "https://httpbin.org/delay/2",
        "https://httpbin.org/delay/3",
        "https://httpbin.org/status/200",
        "https://httpbin.org/status/404",
    }
    
    results := make(chan URLResult, len(urls))
    
    start := time.Now()
    
    // 并发抓取
    for _, url := range urls {
        go fetchURL(url, results)
    }
    
    // 收集结果
    for i := 0; i < len(urls); i++ {
        result := <-results
        if result.Error != nil {
            fmt.Printf("Error fetching %s: %v\n", result.URL, result.Error)
        } else {
            fmt.Printf("URL: %s, Status: %d, Size: %d bytes\n", 
                result.URL, result.Status, result.Size)
        }
    }
    
    fmt.Printf("Total time: %v\n", time.Since(start))
}
```

### 限流器实现

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

type RateLimiter struct {
    rate     int
    interval time.Duration
    tokens   chan struct{}
    stop     chan struct{}
    mu       sync.Mutex
}

func NewRateLimiter(rate int, interval time.Duration) *RateLimiter {
    rl := &RateLimiter{
        rate:     rate,
        interval: interval,
        tokens:   make(chan struct{}, rate),
        stop:     make(chan struct{}),
    }
    
    // 初始化令牌
    for i := 0; i < rate; i++ {
        rl.tokens <- struct{}{}
    }
    
    // 启动令牌补充 goroutine
    go rl.refillTokens()
    
    return rl
}

func (rl *RateLimiter) refillTokens() {
    ticker := time.NewTicker(rl.interval)
    defer ticker.Stop()
    
    for {
        select {
        case <-ticker.C:
            // 尝试添加令牌
            select {
            case rl.tokens <- struct{}{}:
            default:
                // 令牌桶已满
            }
        case <-rl.stop:
            return
        }
    }
}

func (rl *RateLimiter) Allow() bool {
    select {
    case <-rl.tokens:
        return true
    default:
        return false
    }
}

func (rl *RateLimiter) Wait() {
    <-rl.tokens
}

func (rl *RateLimiter) Stop() {
    close(rl.stop)
}

func main() {
    // 创建限流器：每秒最多 2 个请求
    limiter := NewRateLimiter(2, time.Second)
    defer limiter.Stop()
    
    // 模拟请求
    for i := 0; i < 10; i++ {
        go func(id int) {
            if limiter.Allow() {
                fmt.Printf("Request %d: Allowed at %v\n", id, time.Now())
            } else {
                fmt.Printf("Request %d: Rate limited at %v\n", id, time.Now())
            }
        }(i)
    }
    
    time.Sleep(5 * time.Second)
}
```

## 最佳实践

### 1. 避免竞态条件

```go
// 错误示例
type Counter struct {
    value int
}

func (c *Counter) Increment() {
    c.value++  // 竞态条件
}

// 正确示例
type SafeCounter struct {
    mu    sync.Mutex
    value int
}

func (c *SafeCounter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.value++
}
```

### 2. 避免 Goroutine 泄露

```go
// 错误示例
func process() {
    go func() {
        // 无限循环，永远不会结束
        for {
            // 处理逻辑
        }
    }()
}

// 正确示例
func process(ctx context.Context) {
    go func() {
        for {
            select {
            case <-ctx.Done():
                return  // 优雅退出
            default:
                // 处理逻辑
            }
        }
    }()
}
```

### 3. 使用带缓冲的通道避免死锁

```go
// 可能死锁
func deadlockExample() {
    ch := make(chan int)
    ch <- 1  // 阻塞，因为没有接收者
    <-ch
}

// 避免死锁
func noDeadlockExample() {
    ch := make(chan int, 1)  // 带缓冲
    ch <- 1
    <-ch
}
```

## 总结

Go 的并发编程提供了强大的工具：

1. **Goroutines**：轻量级线程，易于创建和管理
2. **Channels**：类型安全的通信机制
3. **Select**：多路复用，处理多个通道操作
4. **同步原语**：Mutex、WaitGroup、Once 等
5. **并发模式**：生产者-消费者、工作池、扇出/扇入

掌握这些概念和模式，能够帮助你编写高效、安全的并发程序。记住 Go 的并发哲学："不要通过共享内存来通信，要通过通信来共享内存"。