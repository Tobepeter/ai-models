import { useMount } from 'ahooks'

/**
 * 禁用sarari的滚动回弹
 * NOTE: 只有页面确定不滚动才需要
 */
export const useLockScroll = () => {
	useMount(() => {
		const target = document.body
		target.style.overflow = 'hidden'
		return () => {
			target.style.overflow = 'auto'
		}
	})
}
