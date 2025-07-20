import { withCondHook } from '@/hoc/withCondHook'
import { useLockScroll } from '@/hooks/use-lock-scroll'
import styled from '@emotion/styled'
import { PropsWithChildren } from 'react'

// NOTE：千万不要函数内定义，否则每次render都是一个新的组件，导致整个页面重新渲染
const ScreenContainer = styled.div<{ height: string }>`
	height: 100vh;
	height: ${({ height }) => height};
`

/**
 * 屏幕容器组件
 *
 * 专门针对移动设备包含，地址栏或者工具栏适配的
 * 使用 dvh, 或者 svh, 如果不支持，默认降级为 vh
 */
export const Screen = (props: PropsWithChildren<ScreenProps>) => {
	const { noLockScroll, dynamicHeight, children } = props
	const LockScroll = withCondHook(useLockScroll, !noLockScroll)

	const height = dynamicHeight ? '100dvh' : '100svh'

	return (
		<ScreenContainer height={height}>
			<LockScroll />
			{children}
		</ScreenContainer>
	)
}

export type ScreenProps = {
	noLockScroll?: boolean
	dynamicHeight?: boolean
}
