# Api接口工作流

## 前端

### 代码生成和拦截器
- 前端代码已经通过脚本自动生成，包含client代码
- 前端注入了一些常用的 interceptor，如自动错误notify
- 拦截器会自动处理HTTP状态码错误和网络异常
- 前端架构支持自动监控后端生成swagger和前端的client代码，改动go一般不需要手动swagger

### 错误处理模式
- `silent` 模式：适用于静默执行，无任何报错提示
- `noToastError` 默认false，表示api拦截器会自动处理错误并显示Toast提示，前端只会拿到null
- 前端不需要一直写try-catch，后端如果不额外配置，一般都会自动catch异常
- **重要**：对于有自动错误处理的API调用，应该移除不必要的try-catch块

### API调用最佳实践
- 业务组件应该专注于业务逻辑，让API拦截器处理通用错误
- 只在需要特殊错误处理逻辑时才添加try-catch
- 使用`silent`模式进行后台数据更新，避免用户感知
- 利用API返回的结果判断（null表示失败）而不是捕获异常

### 生成的API类型
- 所有API接口的TypeScript类型都会自动生成
- 请求和响应的数据结构保持类型安全
- 位于`src/api/swagger/generated.ts`

## 后端

### 架构
- 后端api位于backend文件夹下面，采用Go语言架构
- 遵循RESTful API设计规范
- 统一的错误处理和响应格式

### Swagger文档
- 后端提供完整的Swagger API文档
- 前端代码生成基于Swagger规范
- 确保API文档与实际实现保持同步
