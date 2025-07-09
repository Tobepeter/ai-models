import { useUnmount } from 'ahooks'
import { useState } from 'react'
import { AnyFn } from '@/utils/types'

export const useTimer = () => {
	const [timeId, setTimeId] = useState(0)
	const [isRunning, setIsRunning] = useState(false)

	const clear = () => {
		setIsRunning(false)
		clearInterval(timeId)
		clearTimeout(timeId)
		setTimeId(0)
	}

	const start = (delay: number, fn: AnyFn) => {
		setIsRunning(true)
		clear()
		const timer = setTimeout(() => {
			fn()
		}, delay) as any
		setTimeId(timer)
	}

	const loop = (dur: number, fn: AnyFn) => {
		setIsRunning(true)
		clear()
		const timer = setInterval(() => {
			fn()
		}, dur) as any
		setTimeId(timer)
	}

	useUnmount(() => {
		clear()
	})

	return {
		timeId,
		isRunning,
		start,
		clear,
		loop,
	}
}
