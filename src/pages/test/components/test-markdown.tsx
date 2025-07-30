import { Markdown } from '@/components/common/markdown'

/**
 * Markdown 组件测试
 */
const TestMarkdown = () => {
	const testCases = [
		{
			title: '基础语法',
			content: `# 一级标题
## 二级标题
### 三级标题

这是一个段落，包含 **粗体文本** 和 *斜体文本*。

这是另一个段落，包含 \`行内代码\` 和 [链接](https://example.com)。`,
		},
		{
			title: '列表',
			content: `## 无序列表
- 第一项
- 第二项
  - 嵌套项目
  - 另一个嵌套项目
- 第三项

## 有序列表
1. 第一步
2. 第二步
3. 第三步`,
		},
		{
			title: '代码块',
			content: `## JavaScript 代码
\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`)
  return \`Welcome to the app!\`
}

const user = 'World'
hello(user)
\`\`\`

## TypeScript 代码
\`\`\`typescript
interface User {
  id: number
  name: string
  email?: string
}

const createUser = (data: Omit<User, 'id'>): User => {
  return {
    id: Math.random(),
    ...data
  }
}
\`\`\``,
		},
		{
			title: '引用和分割线',
			content: `## 引用块
> 这是一个引用块
> 可以包含多行内容
> 
> 甚至可以包含 **格式化文本**

---

## 分割线上方
这是分割线上方的内容。

---

## 分割线下方
这是分割线下方的内容。`,
		},
		{
			title: '表格',
			content: `## 数据表格
| 姓名 | 年龄 | 职业 |
|------|------|------|
| 张三 | 25 | 工程师 |
| 李四 | 30 | 设计师 |
| 王五 | 28 | 产品经理 |

## 对齐表格
| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:-------:|-------:|
| 内容1  |  内容2  |  内容3 |
| 较长的内容 | 中等 | 短 |`,
		},
		{
			title: '混合内容',
			content: `# 完整示例

这是一个包含多种 **Markdown** 语法的示例。

## 功能特性
- ✅ 支持基础语法
- ✅ 代码高亮
- ✅ 表格渲染
- ⚠️ TODO: 数学公式
- ⚠️ TODO: Mermaid 图表

### 代码示例
\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 计算前10个斐波那契数
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

> **注意**: 这只是一个演示，实际的斐波那契实现应该使用动态规划来避免重复计算。

### 性能对比
| 方法 | 时间复杂度 | 空间复杂度 |
|------|------------|------------|
| 递归 | O(2^n) | O(n) |
| 动态规划 | O(n) | O(n) |
| 迭代 | O(n) | O(1) |`,
		},
		{
			title: 'noMarkdown 测试',
			content: `# 这应该显示为纯文本
**不应该** 被渲染为粗体
\`代码\` 也不应该高亮

- 列表项
- 另一个列表项`,
			noMarkdown: true,
		},
	]

	return (
		<div className="p-4 max-w-4xl mx-auto" data-slot="test-markdown">
			<h2 className="text-2xl font-bold mb-6">Markdown 组件测试</h2>
			<div className="space-y-8">
				{testCases.map((testCase, idx) => (
					<div key={idx} className="border rounded-lg p-4">
						<div className="flex items-center gap-2 mb-4">
							<h3 className="text-lg font-semibold">{testCase.title}</h3>
							{testCase.noMarkdown && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">noMarkdown=true</span>}
						</div>
						<div className="bg-muted/50 rounded-md p-4">
							<Markdown content={testCase.content} noMarkdown={testCase.noMarkdown} />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default TestMarkdown
