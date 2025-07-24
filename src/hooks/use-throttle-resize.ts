import { useThrottleFn } from 'ahooks'
import { useEffect, useState } from 'react'

// 节流resize
export const useThrottleResize = (delay = 100) => {
	const [size, setSize] = useState(() => ({
		width: window.innerWidth,
		height: window.innerHeight,
	}))

	const resize = useThrottleFn(
		() => {
			setSize({
				width: window.innerWidth,
				height: window.innerHeight,
			})
		},
		{
			wait: delay,
		}
	)

	useEffect(() => {
		window.addEventListener('resize', resize.run)
		return () => {
			window.removeEventListener('resize', resize.run)
		}
	}, [resize])

	return size
}
