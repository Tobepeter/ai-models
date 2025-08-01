import { UserAvatar } from '@/components/common/user-avatar'
import { useUserStore } from '@/store/user-store'

/** 用户头像组件 */
export const MyAvatar = (props: MyAvatarProps) => {
	const { onClick, noPreview = false, size = 64, className } = props
	const { info: user } = useUserStore()
	const username = user?.username || ''

	const avatarSrc = user?.avatar || ''
	const fallbackText = user?.username?.charAt(0).toUpperCase() || 'U'

	if (onClick) {
		// 如果有 onClick 回调，包装点击事件
		return (
			<div className={className} onClick={onClick}>
				<UserAvatar src={avatarSrc} username={username} size={size} fallbackText={fallbackText} noPreview={true} />
			</div>
		)
	}

	return <UserAvatar src={avatarSrc} username={username} size={size} fallbackText={fallbackText} noPreview={noPreview} className={className} />
}

export interface MyAvatarProps {
	onClick?: () => void // 点击回调，如果提供则屏蔽预览功能
	noPreview?: boolean // 禁用预览功能
	size?: number // 头像大小
	className?: string // 额外的类名
}
