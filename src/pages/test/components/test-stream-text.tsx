import { StreamText } from '@/components/common/stream-text'
import { Markdown } from '@/components/common/markdown'
import { Button } from '@/components/ui/button'
import { useInterval, useMount } from 'ahooks'
import { useState } from 'react'

/**
 * 测试聊天流式输出效果
 */
const TestStreamText = () => {
	const [displayText, setDisplayText] = useState('')
	const [isRunning, setIsRunning] = useState(false)
	const [currIdx, setCurrIdx] = useState(0)
	const [useMarkdown, setUseMarkdown] = useState(false)

	const plainText = '这是一个测试文本，用来验证聊天消息的流式输出效果。每个字符都会逐个出现，产生打字机的效果。'.repeat(10)

	const markdownText = `# 测试 Markdown 流式渲染

这是一个 **测试文档**，用来验证 *Markdown* 在流式输出时的性能表现。

## 代码块示例

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`)
  return "Welcome!"
}
\`\`\`

## 列表示例

- 第一项：包含 \`行内代码\` 的列表项
- 第二项：包含 **粗体文本** 的列表项  
- 第三项：包含 [链接](https://example.com) 的列表项

## 表格示例

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 较长的数据内容 | 中等长度 | 短 |

> 这是一个引用块，用来测试引用渲染性能。
> 
> 可以包含多行内容和 **格式化文本**。

---

这样的复杂 Markdown 内容在流式渲染时可能会导致性能问题，因为每个字符的增加都会触发整个 Markdown 的重新解析和渲染。`.repeat(3)

	const fullText = useMarkdown ? markdownText : plainText
	const interval = 10

	useInterval(
		() => {
			if (currIdx < fullText.length) {
				setDisplayText(fullText.slice(0, currIdx + 1))
				setCurrIdx(currIdx + 1)
			} else {
				setIsRunning(false)
			}
		},
		isRunning ? interval : null
	)

	const handleStart = () => {
		setDisplayText('')
		setCurrIdx(0)
		setIsRunning(true)
	}

	useMount(() => {
		handleStart()
	})

	const handleStop = () => {
		setIsRunning(false)
	}

	const handleReset = () => {
		setDisplayText('')
		setCurrIdx(0)
		setIsRunning(false)
	}

	return (
		<div className="p-6 max-w-2xl mx-auto" data-slot="test-stream-text">
			<h2 className="text-xl font-bold mb-4">测试聊天流式输出</h2>

			<div className="mb-4 space-x-2">
				<Button onClick={handleStart} disabled={isRunning}>
					开始
				</Button>
				<Button onClick={handleStop} disabled={!isRunning} variant="outline">
					停止
				</Button>
				<Button onClick={handleReset} variant="outline">
					重置
				</Button>
				<Button onClick={() => setUseMarkdown(!useMarkdown)} variant={useMarkdown ? 'default' : 'outline'}>
					{useMarkdown ? 'Markdown 模式' : '纯文本模式'}
				</Button>
			</div>

			<div className="border rounded-lg p-4 bg-muted min-h-[100px]">
				<StreamText content={displayText} />
			</div>

			<div className="mt-4 text-sm text-muted-foreground">
				<p>
					当前字符数: {displayText.length}/{fullText.length}
				</p>
				<p>状态: {isRunning ? '运行中' : '已停止'}</p>
			</div>
		</div>
	)
}

export default TestStreamText
