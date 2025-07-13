# 项目概述

这是一个基于 React 的 AI 模型项目，展示了多种 AI 能力，包括文本生成、图像生成、视频生成和音频生成。
项目支持多个 AI 平台，并提供模拟和真实的实现。

## 关键命令

### 开发
- `npm run dev` - 启动开发服务器
- `npm run build` - 生产构建（先运行 TypeScript 编译，然后运行 Vite 构建）
- `npm run preview` - 预览生产构建
- `npm run mock-server` - 启动模拟服务器进行测试

### 代码质量
- `npm run lint` - 运行 ESLint
- `npm run lint:fix` - 运行 ESLint 并自动修复
- `npm run format` - 使用 Prettier 格式化代码
- `npm run format:check` - 检查格式但不修复
- `npm run type-check` - 运行 TypeScript 类型检查

## 架构

### 核心结构
- **页面**: 三个主要页面 - `/test`（组件展示）、`/chat`（单一 AI 聊天）、`/chat-hub`（多模型对比）
- **路由**: React Router v7，在 App 组件下使用嵌套路由
- **状态管理**: Zustand 用于全局状态，每个主要功能都有独立的 store
- **UI 组件**: shadcn/ui 组件配合 Tailwind CSS v4

### AI 代理系统
项目使用模块化的 AI 代理架构：

- **AIAgentManager** (`src/utils/ai-agent/ai-agent-mgr.ts`): 处理平台切换和代理生命周期的单例管理器
- **平台支持**: 目前支持 SiliconFlow、OpenRouter 和 Mock 平台
- **代理接口**: 所有 AI 平台的通用接口 (`IAiAgent`)
- **能力**: 文本生成（支持流式）、图像生成、视频生成、音频生成

### 聊天系统架构
- **单一聊天** (`src/pages/chat/`): 支持媒体类型选择的个人 AI 对话
- **聊天中心** (`src/pages/chat-hub/`): 多模型对比界面，可同时在多个模型上运行相同的提示
- **聊天管理器**: 独立的管理器类处理每种聊天类型的业务逻辑
- **Store 模式**: 每个主要功能都有自己的 Zustand store（chat-store、chat-hub-store、global store）

### 关键模式
- **管理器模式**: 业务逻辑分离到管理器类中（ChatManager、ChatHubManager、AIAgentManager）
- **事件系统**: EventBus 用于组件间的解耦通信
- **模拟支持**: 基于环境的模拟和真实 AI 服务切换
- **流式传输**: 支持流式传输的实时文本生成
- **媒体类型**: 统一处理文本、图像、视频和音频生成

### 环境配置
- 使用 `src/utils/env.ts` 进行环境变量管理
- 可以为开发/测试启用模拟模式
- AI 平台配置集中在代理实现中

## 测试
- 未配置特定的测试框架 - 检查 README 或询问用户测试方法
- 虽然代码有story-book，不过我目前主要使用 `src/pages/test/test.tsx` 进行我的运行回归测试
