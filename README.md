# AI Models 项目

一个使用现代 React 技术栈构建的完整项目，集成了多个流行的库和工具。

## 🚀 技术栈

- **⚡ Vite** - 快速构建工具
- **⚛️ React 18** - 用户界面库
- **🔷 TypeScript** - 类型安全的 JavaScript
- **🎨 Tailwind CSS v4** - 原子化 CSS 框架
- **🎭 shadcn/ui** - 美观的 UI 组件库
- **🪝 ahooks** - 实用的 React Hooks 库
- **🔍 TanStack Query** - 强大的数据获取库
- **🏪 Zustand** - 简洁的状态管理库
- **🛣️ React Router** - 路由管理
- **📡 Axios** - HTTP 客户端

## 📦 项目结构

\`\`\`
src/
├── components/
│ └── ui/ # shadcn/ui 组件
├── lib/
│ ├── utils.ts # 工具函数
│ ├── axios.ts # Axios 配置
│ └── react-query.ts # React Query 配置
├── pages/
│ └── TestPage.tsx # 测试页面
├── router/
│ └── index.tsx # 路由配置
├── store/
│ └── index.ts # Zustand 状态管理
├── App.tsx # 根组件
├── main.tsx # 应用入口
└── index.css # 全局样式
\`\`\`

## 🛠️ 开发工具配置

### Prettier 配置

- 使用 Tab 缩进，缩进宽度为 2
- 不使用分号
- 使用单引号
- 打印宽度为 80 字符

### TypeScript 配置

- 严格模式
- 路径别名：\`@/\` 指向 \`src/\`
- 现代 ES 模块配置

## 🎯 功能特性

### 组件展示

- **按钮组件** - 多种样式和尺寸的按钮
- **表单组件** - 输入框、选择器、文本域
- **卡片组件** - 结构化内容展示
- **标签页组件** - 切换内容视图
- **手风琴组件** - 可折叠的内容区域
- **开关组件** - 切换状态控件
- **复选框组件** - 选择控件
- **进度条组件** - 进度显示
- **徽章组件** - 状态标签

### 路由配置

- 使用 React Router 进行路由管理
- 应用启动时自动跳转到测试页面
- 支持嵌套路由结构

### 状态管理

- 使用 Zustand 进行全局状态管理
- 包含主题、用户信息、加载状态等

### 数据获取

- 使用 TanStack Query 进行数据获取和缓存
- 使用 ahooks 提供的实用 hooks
- Axios 配置了请求/响应拦截器

## 🚀 快速开始

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

### 构建生产版本

\`\`\`bash
npm run build
\`\`\`

### 预览生产版本

\`\`\`bash
npm run preview
\`\`\`

### 代码格式化

\`\`\`bash
npm run lint
\`\`\`

## 📝 使用说明

1. **启动项目**：运行 \`npm run dev\` 启动开发服务器
2. **访问测试页面**：应用会自动跳转到 \`/test\` 路由
3. **组件展示**：测试页面展示了所有可用的 shadcn/ui 组件
4. **状态管理**：使用 Zustand store 管理全局状态
5. **数据获取**：使用 TanStack Query 和 ahooks 进行数据管理

## 🔧 自定义配置

### 环境变量

创建 \`.env\` 文件来配置环境变量：

\`\`\`env
VITE_API_URL=http://localhost:3000/api
\`\`\`

### 主题定制

修改 \`src/index.css\` 中的 \`@theme\` 指令来自定义主题：

\`\`\`css
@theme {
--color-primary: oklch(15% 0.014 285.8);
--color-secondary: oklch(96% 0.013 285.8);
--spacing: 0.25rem;
--radius: 0.5rem;
/_ ... 其他变量 _/
}
\`\`\`

### 添加新组件

1. 在 \`src/components/ui/\` 目录下创建新组件
2. 使用 shadcn/ui 的样式约定
3. 导出组件供其他文件使用
