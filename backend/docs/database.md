# 数据库操作指南

## 目录
- [GORM 基础](#gorm-基础)
- [模型定义](#模型定义)
- [数据库连接](#数据库连接)
- [CRUD 操作](#crud-操作)
- [关联关系](#关联关系)
- [查询优化](#查询优化)
- [事务处理](#事务处理)

## GORM 基础

GORM 是 Go 语言的 ORM（对象关系映射）库，提供了便捷的数据库操作方法。

### 安装

```bash
go get -u gorm.io/gorm
go get -u gorm.io/driver/mysql
go get -u gorm.io/driver/postgres
go get -u gorm.io/driver/sqlite
```

### 基本概念

```go
package main

import (
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
)

type User struct {
    ID       uint   `gorm:"primarykey"`
    Name     string
    Email    string `gorm:"unique"`
    Age      int
    Birthday time.Time
}

func main() {
    // 连接数据库
    dsn := "user:password@tcp(127.0.0.1:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local"
    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
    if err != nil {
        panic("failed to connect database")
    }
    
    // 自动迁移
    db.AutoMigrate(&User{})
    
    // 创建用户
    user := User{Name: "Alice", Email: "alice@example.com", Age: 25}
    db.Create(&user)
    
    // 查询用户
    var result User
    db.First(&result, 1) // 查找 ID 为 1 的用户
    
    // 更新用户
    db.Model(&result).Update("Age", 26)
    
    // 删除用户
    db.Delete(&result)
}
```

## 模型定义

### 基本模型

```go
type User struct {
    ID        uint      `gorm:"primarykey"`
    CreatedAt time.Time
    UpdatedAt time.Time
    DeletedAt gorm.DeletedAt `gorm:"index"`
    
    Name  string `gorm:"size:100;not null"`
    Email string `gorm:"unique;not null"`
    Age   int    `gorm:"check:age > 0"`
}

// 自定义表名
func (User) TableName() string {
    return "users"
}
```

### 项目中的模型定义

```go
// internal/models/user.go
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

// internal/models/ai.go
type ConversationHistory struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    UserID    uint      `json:"user_id" gorm:"not null"`
    SessionID string    `json:"session_id" gorm:"not null"`
    Role      string    `json:"role" gorm:"not null"`
    Content   string    `json:"content" gorm:"type:text;not null"`
    Model     string    `json:"model"`
    CreatedAt time.Time `json:"created_at"`
    
    // 关联关系
    User User `json:"-" gorm:"foreignKey:UserID"`
}
```

### 字段标签

```go
type User struct {
    ID       uint   `gorm:"primarykey"`                    // 主键
    Name     string `gorm:"size:255"`                      // 字符串长度
    Email    string `gorm:"unique;not null"`               // 唯一且非空
    Age      int    `gorm:"default:18"`                    // 默认值
    Status   string `gorm:"type:enum('active','inactive')"` // 枚举类型
    Profile  string `gorm:"type:text"`                     // 文本类型
    Price    float64 `gorm:"precision:10;scale:2"`         // 精度和小数位
    IsActive bool   `gorm:"default:true"`                  // 布尔默认值
    
    // 时间戳
    CreatedAt time.Time
    UpdatedAt time.Time
    DeletedAt gorm.DeletedAt `gorm:"index"`
}
```

## 数据库连接

### 连接配置

```go
package database

import (
    "fmt"
    "gorm.io/driver/mysql"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
)

type Config struct {
    Host     string
    Port     string
    User     string
    Password string
    DBName   string
    SSLMode  string
}

func NewMySQLConnection(config Config) (*gorm.DB, error) {
    dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
        config.User, config.Password, config.Host, config.Port, config.DBName)
    
    db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
        Logger: logger.Default.LogMode(logger.Info),
    })
    
    if err != nil {
        return nil, err
    }
    
    // 配置连接池
    sqlDB, err := db.DB()
    if err != nil {
        return nil, err
    }
    
    sqlDB.SetMaxIdleConns(10)
    sqlDB.SetMaxOpenConns(100)
    sqlDB.SetConnMaxLifetime(time.Hour)
    
    return db, nil
}

func NewPostgreSQLConnection(config Config) (*gorm.DB, error) {
    dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
        config.Host, config.Port, config.User, config.Password, config.DBName, config.SSLMode)
    
    return gorm.Open(postgres.Open(dsn), &gorm.Config{})
}
```

### 项目中的数据库初始化

```go
// 在项目中添加数据库初始化
package database

import (
    "ai-models-backend/internal/models"
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
)

var DB *gorm.DB

func Initialize(config Config) error {
    var err error
    DB, err = NewMySQLConnection(config)
    if err != nil {
        return err
    }
    
    // 自动迁移
    err = DB.AutoMigrate(
        &models.User{},
        &models.ConversationHistory{},
    )
    if err != nil {
        return err
    }
    
    return nil
}

func GetDB() *gorm.DB {
    return DB
}
```

## CRUD 操作

### 创建（Create）

```go
// 创建单条记录
user := User{Name: "Alice", Email: "alice@example.com"}
result := db.Create(&user)
// user.ID 会被自动设置
fmt.Printf("Created user ID: %d\n", user.ID)
fmt.Printf("Affected rows: %d\n", result.RowsAffected)

// 批量创建
users := []User{
    {Name: "Alice", Email: "alice@example.com"},
    {Name: "Bob", Email: "bob@example.com"},
}
db.Create(&users)

// 创建时指定字段
db.Select("name", "email").Create(&user)

// 忽略某些字段
db.Omit("password").Create(&user)
```

### 查询（Read）

```go
// 查询第一条记录
var user User
db.First(&user) // 按主键升序
db.Last(&user)  // 按主键降序
db.Take(&user)  // 随机获取一条

// 按主键查询
db.First(&user, 10)
db.First(&user, "10")

// 条件查询
db.Where("name = ?", "Alice").First(&user)
db.Where("name = ? AND age >= ?", "Alice", 18).Find(&users)

// 结构体查询
db.Where(&User{Name: "Alice", Age: 20}).First(&user)

// Map 查询
db.Where(map[string]interface{}{"name": "Alice", "age": 20}).Find(&users)

// 范围查询
db.Where("age IN ?", []int{20, 25, 30}).Find(&users)

// 模糊查询
db.Where("name LIKE ?", "%alice%").Find(&users)

// 排序
db.Order("age desc, name").Find(&users)

// 限制和偏移
db.Limit(10).Offset(20).Find(&users)

// 查询指定字段
db.Select("name", "email").Find(&users)

// 去重
db.Distinct("name").Find(&users)
```

### 更新（Update）

```go
// 更新单个字段
db.Model(&user).Update("name", "New Name")

// 更新多个字段
db.Model(&user).Updates(User{Name: "New Name", Age: 25})
db.Model(&user).Updates(map[string]interface{}{"name": "New Name", "age": 25})

// 更新指定字段
db.Model(&user).Select("name").Updates(map[string]interface{}{"name": "New Name", "age": 25})

// 忽略某些字段
db.Model(&user).Omit("created_at").Updates(map[string]interface{}{"name": "New Name", "age": 25})

// 批量更新
db.Model(&User{}).Where("active = ?", true).Update("name", "New Name")

// 使用表达式更新
db.Model(&user).Update("age", gorm.Expr("age + ?", 1))
```

### 删除（Delete）

```go
// 删除记录
db.Delete(&user, 1)

// 条件删除
db.Where("name = ?", "Alice").Delete(&User{})

// 批量删除
db.Delete(&User{}, []int{1, 2, 3})

// 软删除（如果模型有 DeletedAt 字段）
db.Delete(&user) // 实际上是设置 DeletedAt

// 永久删除
db.Unscoped().Delete(&user)

// 查询包含软删除的记录
db.Unscoped().Where("age = 20").Find(&users)
```

## 关联关系

### 一对一关系

```go
type User struct {
    ID      uint
    Name    string
    Profile Profile
}

type Profile struct {
    ID     uint
    UserID uint
    Bio    string
}

// 创建关联
user := User{
    Name: "Alice",
    Profile: Profile{Bio: "Developer"},
}
db.Create(&user)

// 预加载关联
var user User
db.Preload("Profile").First(&user)
```

### 一对多关系

```go
type User struct {
    ID    uint
    Name  string
    Posts []Post
}

type Post struct {
    ID     uint
    UserID uint
    Title  string
    User   User
}

// 创建关联
user := User{
    Name: "Alice",
    Posts: []Post{
        {Title: "Post 1"},
        {Title: "Post 2"},
    },
}
db.Create(&user)

// 预加载关联
var user User
db.Preload("Posts").First(&user)
```

### 多对多关系

```go
type User struct {
    ID    uint
    Name  string
    Roles []Role `gorm:"many2many:user_roles;"`
}

type Role struct {
    ID    uint
    Name  string
    Users []User `gorm:"many2many:user_roles;"`
}

// 创建关联
user := User{
    Name: "Alice",
    Roles: []Role{
        {Name: "Admin"},
        {Name: "User"},
    },
}
db.Create(&user)

// 预加载关联
var user User
db.Preload("Roles").First(&user)
```

### 项目中的关联关系

```go
// internal/models/user.go
type User struct {
    ID        uint           `json:"id" gorm:"primaryKey"`
    Username  string         `json:"username" gorm:"uniqueIndex;not null"`
    Email     string         `json:"email" gorm:"uniqueIndex;not null"`
    
    // 一对多关系
    Conversations []ConversationHistory `json:"conversations,omitempty" gorm:"foreignKey:UserID"`
}

// internal/models/ai.go
type ConversationHistory struct {
    ID        uint      `json:"id" gorm:"primaryKey"`
    UserID    uint      `json:"user_id" gorm:"not null"`
    SessionID string    `json:"session_id" gorm:"not null"`
    Role      string    `json:"role" gorm:"not null"`
    Content   string    `json:"content" gorm:"type:text;not null"`
    Model     string    `json:"model"`
    CreatedAt time.Time `json:"created_at"`
    
    // 多对一关系
    User User `json:"-" gorm:"foreignKey:UserID"`
}
```

## 查询优化

### 预加载

```go
// 预加载单个关联
db.Preload("Profile").Find(&users)

// 预加载多个关联
db.Preload("Profile").Preload("Posts").Find(&users)

// 嵌套预加载
db.Preload("Posts.Comments").Find(&users)

// 条件预加载
db.Preload("Posts", "published = ?", true).Find(&users)
```

### 连接查询

```go
// 内连接
db.Joins("Profile").Find(&users)

// 左连接
db.Joins("LEFT JOIN profiles ON users.id = profiles.user_id").Find(&users)

// 连接条件
db.Joins("JOIN profiles ON users.id = profiles.user_id AND profiles.active = ?", true).Find(&users)
```

### 子查询

```go
// 子查询
db.Where("amount > (?)", db.Table("orders").Select("AVG(amount)")).Find(&orders)

// 存在子查询
db.Where("EXISTS (?)", db.Select("*").Table("orders").Where("orders.user_id = users.id")).Find(&users)
```

### 原生 SQL

```go
// 原生查询
var users []User
db.Raw("SELECT * FROM users WHERE name = ?", "Alice").Scan(&users)

// 执行原生 SQL
db.Exec("UPDATE users SET name = ? WHERE id = ?", "New Name", 1)
```

## 事务处理

### 手动事务

```go
func transferMoney(db *gorm.DB, fromID, toID uint, amount float64) error {
    return db.Transaction(func(tx *gorm.DB) error {
        // 扣减发送方余额
        if err := tx.Model(&Account{}).Where("id = ?", fromID).Update("balance", gorm.Expr("balance - ?", amount)).Error; err != nil {
            return err
        }
        
        // 增加接收方余额
        if err := tx.Model(&Account{}).Where("id = ?", toID).Update("balance", gorm.Expr("balance + ?", amount)).Error; err != nil {
            return err
        }
        
        // 记录转账日志
        log := TransferLog{
            FromID: fromID,
            ToID:   toID,
            Amount: amount,
        }
        if err := tx.Create(&log).Error; err != nil {
            return err
        }
        
        return nil
    })
}
```

### 显式事务

```go
func manualTransaction(db *gorm.DB) error {
    tx := db.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()
    
    if err := tx.Error; err != nil {
        return err
    }
    
    // 执行数据库操作
    if err := tx.Create(&user).Error; err != nil {
        tx.Rollback()
        return err
    }
    
    if err := tx.Create(&profile).Error; err != nil {
        tx.Rollback()
        return err
    }
    
    return tx.Commit().Error
}
```

## 实战示例

### 用户服务实现

```go
// internal/services/user.go
package services

import (
    "ai-models-backend/internal/models"
    "ai-models-backend/pkg/database"
    "errors"
    "golang.org/x/crypto/bcrypt"
    "gorm.io/gorm"
)

type UserService struct {
    db *gorm.DB
}

func NewUserService() *UserService {
    return &UserService{
        db: database.GetDB(),
    }
}

func (s *UserService) CreateUser(req models.UserCreateRequest) (*models.User, error) {
    // 检查用户名是否存在
    var existingUser models.User
    if err := s.db.Where("username = ? OR email = ?", req.Username, req.Email).First(&existingUser).Error; err == nil {
        return nil, errors.New("username or email already exists")
    }
    
    // 加密密码
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        return nil, err
    }
    
    // 创建用户
    user := models.User{
        Username: req.Username,
        Email:    req.Email,
        Password: string(hashedPassword),
        IsActive: true,
    }
    
    if err := s.db.Create(&user).Error; err != nil {
        return nil, err
    }
    
    return &user, nil
}

func (s *UserService) GetUserByID(id uint) (*models.User, error) {
    var user models.User
    if err := s.db.First(&user, id).Error; err != nil {
        return nil, err
    }
    return &user, nil
}

func (s *UserService) UpdateUser(id uint, req models.UserUpdateRequest) (*models.User, error) {
    var user models.User
    if err := s.db.First(&user, id).Error; err != nil {
        return nil, err
    }
    
    // 更新字段
    updates := make(map[string]interface{})
    if req.Username != "" {
        updates["username"] = req.Username
    }
    if req.Email != "" {
        updates["email"] = req.Email
    }
    if req.Avatar != "" {
        updates["avatar"] = req.Avatar
    }
    
    if err := s.db.Model(&user).Updates(updates).Error; err != nil {
        return nil, err
    }
    
    return &user, nil
}

func (s *UserService) DeleteUser(id uint) error {
    return s.db.Delete(&models.User{}, id).Error
}

func (s *UserService) GetUsers(page, limit int) ([]models.UserResponse, int64, error) {
    var users []models.User
    var total int64
    
    // 计算总数
    if err := s.db.Model(&models.User{}).Count(&total).Error; err != nil {
        return nil, 0, err
    }
    
    // 分页查询
    offset := (page - 1) * limit
    if err := s.db.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
        return nil, 0, err
    }
    
    // 转换为响应格式
    var responses []models.UserResponse
    for _, user := range users {
        responses = append(responses, user.ToResponse())
    }
    
    return responses, total, nil
}

func (s *UserService) AuthenticateUser(username, password string) (*models.User, error) {
    var user models.User
    if err := s.db.Where("username = ? OR email = ?", username, username).First(&user).Error; err != nil {
        return nil, errors.New("invalid credentials")
    }
    
    // 验证密码
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
        return nil, errors.New("invalid credentials")
    }
    
    return &user, nil
}
```

### AI 服务实现

```go
// internal/services/ai.go
func (s *AIService) GetChatHistory(userID uint, sessionID string) ([]models.ConversationHistory, error) {
    var history []models.ConversationHistory
    
    err := s.db.Where("user_id = ? AND session_id = ?", userID, sessionID).
        Order("created_at ASC").
        Find(&history).Error
    
    return history, err
}

func (s *AIService) SaveChatHistory(userID uint, sessionID, role, content, model string) error {
    history := models.ConversationHistory{
        UserID:    userID,
        SessionID: sessionID,
        Role:      role,
        Content:   content,
        Model:     model,
    }
    
    return s.db.Create(&history).Error
}

func (s *AIService) ClearChatHistory(userID uint, sessionID string) error {
    return s.db.Where("user_id = ? AND session_id = ?", userID, sessionID).
        Delete(&models.ConversationHistory{}).Error
}
```

## 总结

数据库操作是后端开发的核心技能：

1. **GORM 基础**：理解 ORM 的概念和基本使用
2. **模型定义**：正确定义数据模型和字段标签
3. **数据库连接**：配置和管理数据库连接
4. **CRUD 操作**：掌握基本的增删改查操作
5. **关联关系**：处理表之间的关联关系
6. **查询优化**：使用预加载和连接查询优化性能
7. **事务处理**：确保数据的一致性和完整性

在下一章中，我们将学习 API 设计的最佳实践。