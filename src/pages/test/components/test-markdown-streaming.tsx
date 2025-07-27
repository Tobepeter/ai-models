import { useState, useRef } from 'react'
import { useMount } from 'ahooks'
import { Markdown } from '@/components/common/markdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/** Markdown流式测试 */
const TestMarkdownStreaming = () => {
	const [content, setContent] = useState('')
	const [isStreaming, setIsStreaming] = useState(false)
	const [isStream, setIsStream] = useState(true)
	const intervalRef = useRef<NodeJS.Timeout | null>(null)
	const indexRef = useRef(0)

	// 测试用的 markdown 内容
	const testMarkdown = `# Markdown 流式测试

这是一个测试段落，用来演示流式效果。

## 二级标题

### 三级标题

这是另一个段落，包含 **加粗文本** 和 *斜体文本*。

> 这是一个引用块，用来测试块级元素的动画效果。

#### 列表测试

- 第一项
- 第二项
- 第三项

1. 有序列表第一项
2. 有序列表第二项
3. 有序列表第三项

\`\`\`javascript
// 代码块测试
function hello() {
  console.log('Hello, World!')
}
\`\`\`

---

最后一个段落，测试完成！`

	// 开始流式输出
	const startStreaming = () => {
		if (isStreaming) return

		setIsStreaming(true)
		indexRef.current = 0
		setContent('')

		intervalRef.current = setInterval(() => {
			const currentIndex = indexRef.current
			if (currentIndex >= testMarkdown.length) {
				stopStreaming()
				return
			}

			setContent(testMarkdown.slice(0, currentIndex + 1))
			indexRef.current += 1
		}, 50) // 每50ms添加一个字符
	}

	// 停止流式输出
	const stopStreaming = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
		setIsStreaming(false)
	}

	// 重置内容
	const resetContent = () => {
		stopStreaming()
		setContent('')
		indexRef.current = 0
	}

	// 自动开始测试
	useMount(() => {
		setTimeout(() => {
			startStreaming()
		}, 1000) // 1秒后自动开始
	})

	return (
		<div className="container mx-auto p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Markdown 流式测试</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-4">
						<Button onClick={startStreaming} disabled={isStreaming} variant="default">
							{isStreaming ? '正在流式输出...' : '开始'}
						</Button>
						<Button onClick={stopStreaming} disabled={!isStreaming} variant="secondary">
							停止
						</Button>
						<Button onClick={resetContent} variant="outline">
							重置
						</Button>
					</div>

					<div className="flex items-center gap-2">
						<input type="checkbox" id="stream-mode" checked={isStream} onChange={(e) => setIsStream(e.target.checked)} className="w-4 h-4" />
						<label htmlFor="stream-mode" className="text-sm">
							启用流式模式
						</label>
					</div>

					<div className="text-sm text-muted-foreground">
						进度: {content.length} / {testMarkdown.length} 字符
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>渲染结果</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="border rounded-lg p-4 min-h-[400px] bg-background">
						<Markdown content={content} />
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default TestMarkdownStreaming;
