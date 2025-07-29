# 信息流页面

一个类似Twitter/微博的信息流页面，支持无限滚动、点赞、内容折叠等功能。

## 功能特性

### ✅ 已实现功能

- **📱 响应式布局**: 三栏布局（头像信息 + 文字内容 + 单张图片）
- **🔄 无限滚动**: 触底自动加载更多内容
- **⬇️ 下拉刷新**: 顶部刷新按钮，支持手动刷新
- **❤️ 点赞功能**: 带动画效果的点赞/取消点赞
- **📝 长内容折叠**: 超过200字符自动折叠，支持展开/收起
- **🖼️ 图片懒加载**: 进入视口才加载图片，支持点击预览
- **💀 骨架屏**: 加载状态的shimmer效果
- **⚡ 性能优化**: 使用Zustand状态管理，支持数据持久化
- **🎨 动画效果**: 使用framer-motion实现流畅动画

### 🚧 待实现功能

- **📝 创建帖子**: 发布新内容
- **💬 评论功能**: 评论和回复
- **🔗 分享功能**: 分享到其他平台
- **🔍 虚拟滚动**: 长列表性能优化
- **📱 下拉刷新**: 手势下拉刷新

## 技术架构

### 核心文件

```
src/pages/feed/
├── feed.tsx                 # 主页面
├── feed-store.ts           # Zustand状态管理
├── feed-mgr.ts             # 业务逻辑管理器
├── feed-util.ts            # 工具函数
└── components/
    ├── feed-item.tsx       # 单个帖子组件
    ├── feed-header.tsx     # 用户信息头部
    ├── feed-content.tsx    # 文字内容
    ├── feed-image.tsx      # 图片组件
    ├── feed-actions.tsx    # 交互按钮
    ├── feed-list.tsx       # 虚拟滚动列表
    └── feed-skeleton.tsx   # 骨架屏
```

### 技术栈

- **状态管理**: Zustand + 持久化
- **动画**: framer-motion
- **工具库**: lodash-es, dayjs, ahooks
- **UI组件**: shadcn/ui
- **图片处理**: 现有ImagePreview组件
- **模拟数据**: faker.js + dummy.ts

## 使用方法

### 1. 访问页面

```
http://localhost:5173/feed
```

### 2. 测试组件

```
http://localhost:5173/test
```

然后选择 "feed" 测试组件。

### 3. 编程接口

```typescript
import { useFeedStore } from '@/pages/feed/feed-store'
import { feedMgr } from '@/pages/feed/feed-mgr'

// 获取状态
const { posts, loading, hasMore } = useFeedStore()

// 加载数据
await feedMgr.loadInitial()
await feedMgr.loadMore()
await feedMgr.refresh()

// 交互操作
feedMgr.toggleLike(postId)
feedMgr.toggleExpand(postId)
```

## 数据结构

```typescript
interface FeedPost {
	id: string
	userId: string
	username: string
	avatar: string
	status?: string // 用户状态emoji
	content?: string // 可选文字内容
	image?: string // 可选单张图片
	createdAt: string
	likeCount: number
	commentCount: number
	isLiked: boolean
	isExpanded: boolean // 长内容展开状态
}
```

## 性能优化

1. **懒加载**: 图片进入视口才加载
2. **数据持久化**: 最多缓存50条帖子
3. **防抖处理**: 点赞等操作防抖300ms
4. **骨架屏**: 优化加载体验
5. **乐观更新**: 点赞立即响应，失败时回滚

## 自定义配置

### 修改内容长度限制

```typescript
// src/pages/feed/feed-util.ts
readonly MAX_CONTENT_LENGTH = 200 // 修改这个值
```

### 修改分页大小

```typescript
// src/pages/feed/feed-mgr.ts
const posts = this.generateMockPosts(20) // 修改这个值
```

### 修改缓存数量

```typescript
// src/pages/feed/feed-store.ts
posts: state.posts.slice(0, 50) // 修改这个值
```

## 注意事项

1. **图片资源**: 使用dummy.ts提供的占位图片
2. **网络延迟**: 模拟500-1500ms延迟
3. **错误处理**: 支持重试机制
4. **类型安全**: 完整的TypeScript类型支持
5. **移动端适配**: 响应式设计，支持触摸交互
