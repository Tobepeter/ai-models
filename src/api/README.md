# API 文件夹结构说明

本文件夹包含了所有API请求相关的代码，按照功能模块进行组织。

## 文件夹结构

```
src/api/
├── common.ts                 # 基础API响应结构、分页、BaseModel等通用类型
├── axios-client.ts          # 统一的axios客户端配置
├── query-client.ts          # React Query客户端配置
├── index.ts                 # 统一导出所有API功能
├── types/                   # 所有API相关类型定义
│   ├── index.ts            # 类型统一导出
│   ├── auth-types.ts       # 认证相关类型
│   ├── user-types.ts       # 用户相关类型
│   ├── crud-types.ts       # CRUD相关类型
│   └── api-types.ts        # OSS、AI等其他API类型
├── auth/                    # 认证相关API
│   ├── index.ts
│   ├── auth-api.ts         # 认证API类
│   └── auth-query.ts       # 认证相关React Query hooks
├── user/                    # 用户管理相关API
│   ├── index.ts
│   ├── user-api.ts         # 用户API类
│   └── user-query.ts       # 用户相关React Query hooks
├── oss/                     # OSS文件存储相关API
│   ├── index.ts
│   ├── oss-api.ts          # OSS API类
│   └── oss-query.ts        # OSS相关React Query hooks
├── ai/                      # AI相关API
│   ├── index.ts
│   ├── ai-api.ts           # AI API类
│   └── ai-query.ts         # AI相关React Query hooks
└── crud.ts                  # 通用CRUD操作API
```

## 核心文件说明

### common.ts
包含所有API的基础结构：
- `ApiResponse<T>`: 标准API响应格式 (code, msg, data)
- `BaseModel`: 后端固定的基础模型结构 (id, created_at, updated_at)
- `Pagination`: 分页信息结构
- `PaginatedResponse<T>`: 分页响应结构
- 其他通用类型

### types/ 文件夹
按功能模块分类的类型定义，与后端API保持一致：
- **auth-types.ts**: 登录、注册、用户认证相关类型
- **user-types.ts**: 用户管理、用户资料相关类型（与后端UserResponse等保持一致）
- **crud-types.ts**: 通用CRUD操作相关类型
- **api-types.ts**: OSS、AI等其他API相关类型

### 各功能模块
每个功能模块包含：
- **xxx-api.ts**: API类，包含所有HTTP请求方法
- **xxx-query.ts**: React Query hooks，提供缓存、状态管理等功能
- **index.ts**: 模块导出文件

## 使用方式

### 1. 直接使用API类
```typescript
import { authApi, userApi, ossApi, aiApi } from '@/api'

// 登录
const result = await authApi.login({ username: 'test', password: '123456' })

// 获取用户列表
const users = await userApi.getUsers({ page: 1, limit: 10 })
```

### 2. 使用React Query hooks（推荐）
```typescript
import { useLogin, useUsers, useUploadFile } from '@/api'

function LoginForm() {
  const loginMutation = useLogin()
  
  const handleLogin = (data) => {
    loginMutation.mutate(data)
  }
  
  return (
    // JSX...
  )
}

function UserList() {
  const { data: users, isLoading } = useUsers({ page: 1, limit: 10 })
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    // JSX...
  )
}
```

### 3. 使用类型
```typescript
import type { 
  LoginRequest, 
  UserResponse, 
  PaginatedResponse,
  ApiResponse 
} from '@/api'

const handleUserData = (user: UserResponse) => {
  // 处理用户数据
}
```

## 与后端API对应关系

API结构与后端路由保持一致：

- `/users/*` → `user/user-api.ts`
- `/auth/*` → `auth/auth-api.ts` 
- `/oss/*` → `oss/oss-api.ts`
- `/ai/v1/*` → `ai/ai-api.ts`
- `/crud/*` → `crud.ts`

## 注意事项

1. **类型安全**: 所有API调用都有完整的TypeScript类型支持
2. **错误处理**: API类会自动检查响应状态码并抛出错误
3. **缓存管理**: React Query hooks提供自动缓存和状态管理
4. **统一配置**: 所有请求通过`axios-client.ts`统一配置，包含认证、拦截器等
5. **导入路径**: 推荐从`@/api`统一导入，避免深层路径依赖
