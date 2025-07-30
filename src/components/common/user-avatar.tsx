import { CSSProperties, ReactNode } from 'react'
import { User } from 'lucide-react'
import { ImagePreview } from './image-preview'
import { Loading } from './loading'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

/**
 * 用户头像组件
 * 基于shadcn Avatar和ImagePreview封装，支持点击预览功能
 */
export const UserAvatar = (props: UserAvatarProps) => {
	const dfIcon = <User className="w-1/2 h-1/2 text-gray-400" />
	const { src, alt = '用户头像', size = 40, className, style, fallbackIcon = dfIcon, fallbackText, noPreview, editable, dragable, loading } = props

	const boxStyle = { width: size, height: size, ...style }

	// 仅在无src且无fallbackText时展示静态内容
	if (!src && !fallbackText) {
		return (
			<div className={cn('relative overflow-hidden rounded-full bg-gray-100 flex items-center justify-center select-none', className)} style={boxStyle}>
				{fallbackIcon}
			</div>
		)
	}

	// 其他情况都用ImagePreview包装shadcn Avatar
	const avatarContent = (
		<Avatar className="relative w-full h-full" style={boxStyle}>
			{src && <AvatarImage src={src} alt={alt} draggable={dragable} className="select-none" />}
			{!src && fallbackText && (
				<AvatarFallback className="select-none text-gray-600 font-medium" style={{ fontSize: size * 0.4 }}>
					{fallbackText}
				</AvatarFallback>
			)}
			{/* Loading浮层 - 放在Avatar内部继承圆角 */}
			<Loading loading={loading} className="text-white" />
		</Avatar>
	)

	const displayFallbackText = !!fallbackText && !src

	// 如果是fallbackText，不能编辑
	const finialEditable = editable && displayFallbackText

	// 如果是fallbackText，不能预览
	const finalNoPreview = displayFallbackText || noPreview

	// 使用noInteraction来控制是否可预览（相当于noPreview）
	return (
		<ImagePreview url={src} size={size} aspectRatio="1/1" noEditable={!finialEditable} noPreview={finalNoPreview} loading={loading} className={cn('rounded-full', className)} style={boxStyle} data-slot="user-avatar">
			{avatarContent}
		</ImagePreview>
	)
}

export interface UserAvatarProps {
	src?: string // 头像图片URL
	alt?: string // 图片alt文本
	size?: number // 头像尺寸（像素）
	className?: string // 自定义样式类名
	style?: CSSProperties // 内联样式
	fallbackIcon?: ReactNode // 无头像时的占位图标
	fallbackText?: string // 无头像时的文字回退
	noPreview?: boolean // 是否无预览，默认false
	editable?: boolean // 是否可编辑，默认false
	dragable?: boolean // 是否可拖动，默认false
	loading?: boolean // 是否加载中，默认false
}
