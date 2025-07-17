# GitHub Pages 部署指南

本项目已配置为自动部署到 GitHub Pages，支持 SPA 路由和动态 base path 识别。

## 自动部署配置

### 1. GitHub Actions 工作流

项目包含 `.github/workflows/deploy.yml` 文件，配置了以下功能：

- **触发条件**: 推送到 `main` 或 `master` 分支时自动构建和部署
- **构建步骤**: 
  - 安装依赖 (`npm ci`)
  - 类型检查 (`npm run type-check`)
  - 代码检查 (`npm run lint`)
  - 构建项目 (`npm run build`)，设置 `NODE_ENV=production`
- **部署**: 自动部署构建产物到 GitHub Pages

### 2. Vite 配置

`vite.config.ts` 已配置智能的 base 路径识别：

```typescript
// GitHub Pages 配置
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'
const isProduction = process.env.NODE_ENV === 'production'

// 获取 base 路径
const getBasePath = () => {
	if (!isProduction) return '/'
	
	// 如果在 GitHub Actions 中构建，使用仓库名作为 base path
	if (isGitHubActions) {
		const repository = process.env.GITHUB_REPOSITORY || ''
		const repoName = repository.split('/')[1] || 'ai-models'
		return `/${repoName}/`
	}
	
	// 默认 GitHub Pages 路径
	return '/ai-models/'
}
```

这确保了：
- 在开发环境中使用 `/` 作为 base path
- 在 GitHub Actions 中自动使用仓库名作为 base path
- 在其他生产环境中使用默认的 `/ai-models/` 路径

### 3. React Router 配置

`src/router/router.tsx` 已配置正确的 basename：

```typescript
// 获取 base URL，用于 GitHub Pages
const getBasename = () => {
	const base = import.meta.env.BASE_URL || '/'
	// 如果 base 是 /，则返回空字符串（React Router 的默认行为）
	// 如果 base 是 /ai-models/，则返回 /ai-models
	return base === '/' ? '' : base.replace(/\/$/, '')
}

export const router = createBrowserRouter([
	// ... 路由配置
], {
	basename: getBasename(),
})
```

### 4. SPA 路由支持

GitHub Pages 是静态托管服务，不支持服务端路由。我们通过以下方式解决：

- **`public/404.html`**: 
  - 捕获 404 请求，保存原始路径到 sessionStorage
  - 智能识别 base path 并重定向到应用根路径
  - 改进了错误处理和调试信息

- **`src/hooks/useGitHubPagesRouter.ts`**: 
  - React Hook，在应用加载后从 sessionStorage 恢复原始路由
  - 正确处理 base path 的移除和路径标准化
  - 改进了日志记录和边界情况处理

- **`src/App.tsx`**: 集成路由恢复 Hook

**工作流程**:
1. 用户访问 `https://username.github.io/repo-name/chat/123`
2. GitHub Pages 返回 404.html
3. 404.html 保存路径 `/repo-name/chat/123` 到 sessionStorage
4. 重定向到 `/repo-name/`
5. React 应用加载，useGitHubPagesRouter Hook 恢复路由到 `/chat/123`

## 启用 GitHub Pages

### 第一次设置

1. **推送代码到 GitHub**:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

2. **在 GitHub 仓库中启用 Pages**:
   - 进入仓库设置 (Settings)
   - 滚动到 "Pages" 部分
   - 在 "Source" 下选择 "GitHub Actions"
   - 保存设置

3. **等待部署完成**:
   - 查看 "Actions" 标签页监控部署进度
   - 部署完成后，网站将在 `https://username.github.io/repo-name/` 可用

### 后续更新

每次推送到 `main` 分支时，GitHub Actions 会自动：

1. 运行测试和检查
2. 构建项目（设置正确的环境变量）
3. 部署到 GitHub Pages

## 本地测试

### 测试开发环境

```bash
npm run dev
```

### 测试生产构建

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

### 测试 GitHub Pages 环境

要在本地模拟 GitHub Pages 环境：

```bash
# 设置 GitHub Actions 环境变量
export GITHUB_ACTIONS=true
export GITHUB_REPOSITORY=username/repo-name
export NODE_ENV=production

# 构建项目
npm run build

# 使用静态服务器测试
npx serve dist -s
```

## 多仓库支持

由于配置了动态 base path 识别，此项目可以部署到任何 GitHub Pages 仓库：

- **自动识别**: 在 GitHub Actions 中自动使用 `GITHUB_REPOSITORY` 环境变量
- **无需修改**: 不需要为不同仓库修改代码
- **统一配置**: 所有路由和资源路径都会自动适配

## 故障排除

### 常见问题

1. **404 错误**: 
   - 确保 GitHub Pages 设置为使用 "GitHub Actions" 作为源
   - 检查工作流是否成功运行

2. **资源加载失败**: 
   - 检查浏览器控制台是否有 base path 相关错误
   - 确认 Vite 构建时使用了正确的 base path

3. **路由不工作**: 
   - 检查 React Router 是否正确配置了 basename
   - 确认 404.html 和路由恢复脚本正确运行

4. **部署失败**: 
   - 检查 GitHub Actions 工作流日志
   - 确认构建过程中的环境变量设置

### 调试工具

在开发者工具控制台中可以看到：

```javascript
// 404.html 处理日志
"GitHub Pages 404 处理:" {
  original: "/repo-name/chat/123",
  redirectTo: "/repo-name/"
}

// 路由恢复日志
"GitHub Pages 路由恢复:" {
  original: "/repo-name/chat/123",
  base: "/repo-name/",
  target: "/chat/123"
}
```

## 自定义域名（可选）

如果要使用自定义域名：

1. 在 `public/` 目录下创建 `CNAME` 文件
2. 在文件中添加你的域名（如 `example.com`）
3. 在域名提供商处配置 DNS 记录指向 GitHub Pages
4. 注意：使用自定义域名时，base path 应该设置为 `/`

## 安全注意事项

- 不要在代码中包含敏感信息（API 密钥等）
- 使用环境变量进行配置
- 定期更新依赖以修复安全漏洞

## 配置总结

此配置提供了：
- ✅ 自动化部署
- ✅ 智能 base path 识别
- ✅ SPA 路由支持
- ✅ 多仓库兼容
- ✅ 完整的错误处理
- ✅ 详细的调试信息
