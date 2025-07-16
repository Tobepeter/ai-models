# GitHub Pages 部署指南

本项目已配置为自动部署到 GitHub Pages。以下是设置和使用说明。

## 自动部署配置

### 1. GitHub Actions 工作流

项目包含 `.github/workflows/deploy.yml` 文件，配置了以下功能：

- **触发条件**: 推送到 `main` 或 `master` 分支时自动构建和部署
- **构建步骤**: 
  - 安装依赖 (`npm ci`)
  - 类型检查 (`npm run type-check`)
  - 代码检查 (`npm run lint`)
  - 构建项目 (`npm run build`)
- **部署**: 自动部署构建产物到 GitHub Pages

### 2. Vite 配置

`vite.config.ts` 已配置正确的 base 路径：

```typescript
base: process.env.NODE_ENV === 'production' ? '/ai-models/' : '/',
```

这确保在 GitHub Pages 上的资源路径正确。

### 3. SPA 路由支持

GitHub Pages 是静态托管服务，不支持服务端路由。当用户直接访问深层路由（如 `/chat/123`）时，会出现 404 错误。我们通过以下方式解决：

- `public/404.html`: 捕获 404 请求，保存原始路径到 sessionStorage，然后重定向到应用根路径
- `src/hooks/useGitHubPagesRouter.ts`: React Hook，在应用加载后从 sessionStorage 恢复原始路由
- `src/App.tsx`: 集成路由恢复 Hook

**工作流程**:
1. 用户访问 `https://username.github.io/ai-models/chat/123`
2. GitHub Pages 返回 404.html
3. 404.html 保存路径 `/ai-models/chat/123` 到 sessionStorage
4. 重定向到 `/ai-models/`
5. React 应用加载，useGitHubPagesRouter Hook 恢复路由到 `/chat/123`

## 启用 GitHub Pages

### 第一次设置

1. **推送代码到 GitHub**:
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

2. **在 GitHub 仓库中启用 Pages**:
   - 进入仓库设置 (Settings)
   - 滚动到 "Pages" 部分
   - 在 "Source" 下选择 "GitHub Actions"
   - 保存设置

3. **等待部署完成**:
   - 查看 "Actions" 标签页监控部署进度
   - 部署完成后，网站将在 `https://username.github.io/ai-models/` 可用

### 后续更新

每次推送到 `main` 分支时，GitHub Actions 会自动：

1. 运行测试和检查
2. 构建项目
3. 部署到 GitHub Pages

## 本地测试

### 测试生产构建

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

### 测试 GitHub Pages 路径

要在本地测试 GitHub Pages 的路径配置：

```bash
# 设置生产环境变量并构建
NODE_ENV=production npm run build

# 使用静态服务器测试（需要安装 serve）
npx serve dist -s
```

## 故障排除

### 常见问题

1. **404 错误**: 确保 GitHub Pages 设置为使用 "GitHub Actions" 作为源
2. **资源加载失败**: 检查 `vite.config.ts` 中的 base 路径是否正确
3. **路由不工作**: 确保 `404.html` 和路由恢复脚本正确配置

### 检查部署状态

- 在 GitHub 仓库的 "Actions" 标签页查看工作流状态
- 在 "Settings > Pages" 查看部署 URL 和状态

## 自定义域名（可选）

如果要使用自定义域名：

1. 在 `public/` 目录下创建 `CNAME` 文件
2. 在文件中添加你的域名（如 `example.com`）
3. 在域名提供商处配置 DNS 记录指向 GitHub Pages

## 安全注意事项

- 不要在代码中包含敏感信息（API 密钥等）
- 使用环境变量进行配置
- 定期更新依赖以修复安全漏洞
