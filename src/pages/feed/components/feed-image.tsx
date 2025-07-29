import { useState, useRef } from 'react'
import { useInViewport } from 'ahooks'
import { ImagePreview } from '@/components/common/image-preview'
import { cn } from '@/lib/utils'

interface FeedImageProps {
	src: string
	alt?: string
	className?: string
}

/**
 * 信息流图片组件
 * 支持懒加载和点击预览
 */
export const FeedImage = (props: FeedImageProps) => {
	const { src, alt = '图片', className } = props
	const targetRef = useRef<HTMLDivElement>(null)
	const [inViewport] = useInViewport(targetRef)

	// 只有在视口内才开始加载图片
	const shouldLoad = inViewport

	return (
		<div
			ref={targetRef}
			className={cn(
				'relative overflow-hidden rounded-lg bg-gray-100',
				'max-w-full', // 确保不超出容器
				className
			)}
			style={{
				aspectRatio: '16/9', // 固定宽高比，避免布局跳动
				maxHeight: '400px', // 限制最大高度
			}}
		>
			{shouldLoad ? (
				<ImagePreview url={src} noEditable className="w-full h-full" aspectRatio="16/9" />
			) : (
				// 懒加载占位
				<div className="w-full h-full flex items-center justify-center bg-gray-100">
					<div className="animate-pulse bg-gray-200 w-full h-full" />
				</div>
			)}
		</div>
	)
}
