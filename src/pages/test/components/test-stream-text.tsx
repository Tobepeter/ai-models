import { StreamText } from '@/components/common/stream-text'
import { Button } from '@/components/ui/button'
import { useInterval, useMount } from 'ahooks'
import { useState } from 'react'

/**
 * 测试聊天流式输出效果
 */
export const TestStreamText = () => {
	const [displayText, setDisplayText] = useState('')
	const [isRunning, setIsRunning] = useState(false)
	const [currIdx, setCurrIdx] = useState(0)

	const fullText = '这是一个测试文本，用来验证聊天消息的流式输出效果。每个字符都会逐个出现，产生打字机的效果。'.repeat(10)
	const interval = 30

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
		<div className="p-6 max-w-2xl mx-auto">
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
