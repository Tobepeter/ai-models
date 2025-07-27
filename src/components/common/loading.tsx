import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 通用加载组件
 */
export const Loading = forwardRef<LoadingRef, LoadingProps>((props, ref) => {
	const { loading, size = 'md', className, noOverlay = false, overlayClassName, onLoadingChange } = props
	const [internalLoading, setInternalLoading] = useState(false)

	// 当前实际的loading状态：外部传入优先，否则使用内部状态
	const currentLoading = loading !== undefined ? loading : internalLoading

	// 暴露设置内部loading状态的方法
	useImperativeHandle(ref, () => ({
		setLoading: setInternalLoading,
	}))

	// 当loading状态变化时，触发回调
	useEffect(() => {
		onLoadingChange?.(currentLoading)
	}, [currentLoading, onLoadingChange])

	// 如果loading为false，不渲染
	if (!currentLoading) return null

	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-6 h-6',
		lg: 'w-8 h-8',
		xl: 'w-12 h-12',
	}

	const spinner = <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />

	if (!noOverlay) {
		return <div className={cn('absolute inset-0 bg-black/60 flex items-center justify-center', overlayClassName)}>{spinner}</div>
	}

	return spinner
})

// 导出loading hook，方便外部使用
export const useLoading = () => {
	const [loading, setLoading] = useState(false)
	return { loading, setLoading }
}

export interface LoadingRef {
	setLoading: (loading: boolean) => void // 设置内部loading状态
}

export interface LoadingProps {
	loading?: boolean // 外部控制的loading状态，undefined时使用内部状态
	size?: 'sm' | 'md' | 'lg' | 'xl' // 加载图标大小
	className?: string // 图标样式类名
	noOverlay?: boolean // 是否不显示覆盖层，默认false（即默认显示覆盖层）
	overlayClassName?: string // 覆盖层样式类名
	onLoadingChange?: (loading: boolean) => void // loading状态变化回调
}
