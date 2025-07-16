import { withCondHook } from '@/hoc/withCondHook'
import { useLockScroll } from '@/hooks/use-lock-scroll'
import styled from '@emotion/styled'
import { PropsWithChildren } from 'react'

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
	const ScreenContainer = styled.div`
		height: 100vh;
		height: ${height};
	`
	return (
		<ScreenContainer>
			<LockScroll />
			{children}
		</ScreenContainer>
	)
}

export type ScreenProps = {
	noLockScroll?: boolean
	dynamicHeight?: boolean
}
