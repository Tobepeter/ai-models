import { CSSProperties, ReactNode } from 'react'
import { User } from 'lucide-react'
import { ImagePreview } from './image-preview'
import { Loading } from './loading'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

/** 用户头像组件 */
export const UserAvatar = (props: UserAvatarProps) => {
	const dfIcon = <User className="w-1/2 h-1/2 text-gray-400" />
	const { src, username, size = 40, className, style, fallbackIcon = dfIcon, fallbackText, noPreview, editable, dragable, loading } = props
	const alt = fallbackText || username || '' // alt默认为空，如果有fallbackText用fallbackText，否则用username
	const computedFallbackText = fallbackText || username?.charAt(0).toUpperCase() // fallbackText优先，否则用username的首字母大写

	const boxStyle = { width: size, height: size, ...style }

	if (!src && !computedFallbackText) {
		// 仅在无src且无computedFallbackText时展示静态内容
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
			{!src && computedFallbackText && (
				<AvatarFallback className="select-none text-gray-600 font-medium" style={{ fontSize: size * 0.4 }}>
					{computedFallbackText}
				</AvatarFallback>
			)}
			<Loading loading={loading} className="text-white" /> {/* Loading浮层 - 放在Avatar内部继承圆角 */}
		</Avatar>
	)

	const displayFallbackText = !!computedFallbackText && !src

	const finialEditable = editable && displayFallbackText // 如果是fallbackText，不能编辑

	const finalNoPreview = displayFallbackText || noPreview // 如果是fallbackText，不能预览

	return (
		// 使用noInteraction来控制是否可预览（相当于noPreview）
		<ImagePreview
			url={src}
			size={size}
			aspectRatio="1/1"
			noEditable={!finialEditable}
			noPreview={finalNoPreview}
			loading={loading}
			className={cn('rounded-full', className)}
			style={boxStyle}
			data-slot="user-avatar"
		>
			{avatarContent}
		</ImagePreview>
	)
}

export interface UserAvatarProps {
	src?: string // 头像图片URL
	username?: string // 用户名，用于生成fallback文本和alt
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
