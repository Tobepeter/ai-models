import { CSSProperties, ReactNode } from 'react'
import { User } from 'lucide-react'
import { ImagePreview } from './image-preview'
import { cn } from '@/lib/utils'

/**
 * 用户头像组件
 * 基于ImagePreview封装，支持点击预览功能
 */
export const UserAvatar = (props: UserAvatarProps) => {
	const dfIcon = <User className="w-1/2 h-1/2 text-gray-400" />
	const { src, alt = '用户头像', size = 40, className, style, fallbackIcon = dfIcon, noPreview } = props

	const boxStyle = { width: size, height: size, ...style }

	if (noPreview || !src) {
		return (
			<div className={cn('relative overflow-hidden rounded-full bg-gray-100 flex items-center justify-center', className)} style={boxStyle}>
				{src ? <img src={src} alt={alt} className="w-full h-full object-cover" /> : fallbackIcon}
			</div>
		)
	}

	return (
		<ImagePreview url={src} size={size} aspectRatio="1/1" noInteraction={true} className={cn('rounded-full bg-gray-100', className)} style={boxStyle}>
			<div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full">
				<img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
			</div>
		</ImagePreview>
	)
}

export type UserAvatarProps = {
	src?: string // 头像图片URL
	alt?: string // 图片alt文本
	size?: number // 头像尺寸（像素）
	className?: string // 自定义样式类名
	style?: CSSProperties // 内联样式
	fallbackIcon?: ReactNode // 无头像时的占位图标
	noPreview?: boolean // 是否无预览，默认false
}
