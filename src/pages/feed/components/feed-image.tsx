import { ImagePreview } from '@/components/common/image-preview'
import { cn } from '@/lib/utils'

/**
 * 信息流图片组件
 */
export const FeedImage = (props: FeedImageProps) => {
	const { src, className } = props

	return (
		<div
			className={cn('relative overflow-hidden rounded-lg bg-gray-100', 'max-w-full', className)}
			style={{ aspectRatio: '16/9', maxHeight: '400px' }} // 固定宽高比，限制高度
			data-slot="feed-image"
			onClick={(e) => e.stopPropagation()} // 阻止冒泡
		>
			<ImagePreview url={src} noEditable className="w-full h-full" aspectRatio="16/9" />
		</div>
	)
}

export interface FeedImageProps {
	src: string
	className?: string
}
