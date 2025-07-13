# 项目架构设计

## 项目结构规范

### 业务逻辑聚合
- 业务逻辑按 pages 聚合，避免跨页面依赖
- 每个页面维护独立的 store、helper 和组件

### 页面标准结构
```
pages/my-page/
├── my-page.tsx           # 页面主组件
├── my-page-store.ts      # 页面状态管理 (Zustand)
├── my-page-type.ts       # 页面类型定义
├── my-page-helper.ts     # 页面业务逻辑
├── my-page-mgr.ts        # 页面管理器
└── components/           # 页面专用组件
    ├── my-page-component.tsx
    └── my-page-dialog.tsx
```

### 组件分类策略
- **通用组件**: 放在 `src/components/common/`，无业务逻辑
- **业务组件**: 直接消费 store 数据，减少 props 传递复杂度
- **UI 组件**: 使用 shadcn/ui，不修改原始代码

### 状态管理原则
- 业务组件优先消费 store 数据，避免过度 props 传递
- 即使上层组件有状态，业务组件也应直接使用 store
- 使用 Zustand 进行状态管理，保持简洁

### 弹窗管理
- 弹窗状态统一在 store 中管理（如 `showSettings`、`showInvalidAlert`）
- 支持多个触发位置，避免组件间状态传递复杂性
- 弹窗组件在页面主组件中统一渲染，通过 store 状态控制显示
- reset 方法中清理弹窗状态，确保页面重置时弹窗正确关闭

## 代码整理和抽离

### helper 类
- helper 允许访问并修改 store
- helper 目的是为了减轻 组件和 store 的逻辑负担，把一些业务逻辑抽离出来

### manager 类
- 如果逻辑控制比较复杂，而且有较多的状态，考虑追加 manager 类

## 代码组织原则

### 业务逻辑分离
- **Helper 类**: 处理复杂业务逻辑，如平台切换、模型选择
- **Store**: 仅管理状态数据，保持简洁
- **Manager 类**: 处理底层实例管理和接口封装
