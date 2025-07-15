# 代码风格规范

## Prettier 配置
- 使用 Prettier，空格缩进（宽度：2）
- 无分号，单引号，200 字符行宽
- 使用 ES5 逗号规则

## 组件开发规范

### 导出方式
- 优先使用具名导出 `export const MyComponent = () => {}`，避免默认导出

### Props 解构
- 在函数第一行解构 props，参数名使用 `props`

### Prop 设计
- 降低组件使用复杂度，props 能可选就可选
- 回调函数 `onXXX` 尽量设为可选的

### 业务组件 Props
- 业务组件优先消费 store 数据，避免 props 传递
- 即使上层组件有状态，业务组件也应直接使用 store

### 组件结构
- 组件定义在顶部，props 类型定义在下方并使用 `type` 定义，需要 `export`

### 回调命名
- 组件内回调使用 `handleXXX` 命名，避免与 props 的 `onXXX` 冲突

### 受控组件
- 使用 `defaultValue`, `value`, `onChange` 模式，支持内部状态管理

## shadcn/ui 使用规范
- 不要修改 shadcn 原始代码（`src/components/ui/`, `src/lib/utils.ts`, `src/hooks/use-mobile.ts`）
- 使用 `cn` 工具函数合并类名，避免手动条件语法

## Hooks 使用规范
- 优先使用 ahooks 框架
- 挂载/卸载使用 `useMount` 和 `useUnmount`
- 如果一个函数可能被间接延迟调用，请考虑使用 `useMemoizedFn`，防止闭包访问旧数据的问题

## 代码规范

### 代码解构
- 如果是简单if语句，考虑使用三元表达式

### TypeScript 规范
- 充分利用类型推断，避免冗余类型注解
- 导入时优先解构，避免命名空间导入
- 使用 `Record` 代替 `Map`
- 禁用严格的 lint 规则（`noUnusedImports`, `noUnusedVariables` 等）

## 命名规范

### 文件命名
- 使用 kebab-case，避免 index 文件泛滥
- 尽可能具名组件，不要 `type.ts`，而是 `chat-types.ts`

### 变量命名
- 优先使用短名（如 `curr`, `idx`, `msg`）

### 页面文件
- 直接使用功能名，如 `chat.tsx`

## 代码管理类规范
- 使用大写 Class 定义，导出小写实例，减少 static 使用
- JSDoc 保持简短描述，函数注释使用 `/* description */` 格式
- 注释后置，保持克制，只在特殊逻辑处添加
- 简单逻辑尽量写在一行，如 `if (condition) return`