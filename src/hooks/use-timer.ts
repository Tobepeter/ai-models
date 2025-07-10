import { useUnmount } from 'ahooks'
import { useState } from 'react'
import { AnyFn } from '@/utils/types'

export const useTimer = () => {
	const [timeId, setTimeId] = useState(0)
	const [isRunning, setIsRunning] = useState(false)

	const stop = () => {
		setIsRunning(false)
		clearInterval(timeId)
		clearTimeout(timeId)
		setTimeId(0)
	}

	const start = (delay: number, fn: AnyFn) => {
		setIsRunning(true)
		stop()
		const timer = setTimeout(() => {
			fn()
		}, delay) as any
		setTimeId(timer)
	}

	const loop = (dur: number, fn: AnyFn) => {
		setIsRunning(true)
		stop()
		const timer = setInterval(() => {
			fn()
		}, dur) as any
		setTimeId(timer)
	}

	const sleep = (dur: number) => {
		return new Promise((resolve) => {
			setTimeout(resolve, dur)
		})
	}

	const nextFrame = (fn: AnyFn) => {
		start(0, fn)
	}

	const sleepNextFrame = () => {
		return sleep(0)
	}

	useUnmount(() => {
		stop()
	})

	return {
		timeId,
		isRunning,
		start,
		stop,
		sleep,
		nextFrame,
		sleepNextFrame,
		loop,
	}
}
