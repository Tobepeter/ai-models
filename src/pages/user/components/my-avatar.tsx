import { UserAvatar } from '@/components/common/user-avatar'
import { useUserStore } from '@/store/user-store'

/** 用户头像组件 */
export const MyAvatar = (props: MyAvatarProps) => {
	const { onClick, noPreview = false, size = 64, className, userData } = props
	const { info: user } = useUserStore()
	
	// 优先使用外部传入的用户数据，否则使用 store 中的数据
	const currentUser = userData || user
	const username = currentUser?.username || ''

	const avatarSrc = currentUser?.avatar || ''
	const fallbackText = currentUser?.username?.charAt(0).toUpperCase() || 'U'

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
	userData?: {
		username: string
		avatar: string
	} // 外部传入的用户数据
}
