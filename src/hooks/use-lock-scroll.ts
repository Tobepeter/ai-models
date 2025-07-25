import { useMount } from 'ahooks'

/**
 * 禁用sarari的滚动回弹
 * NOTE: 注意只有确定不滚动才需要，否则页面内容超出会无法滚动
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
