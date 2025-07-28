import { UserAvatar } from '@/components/common/user-avatar'
import { useUserStore } from '@/store/user-store'

interface MyAvatarProps {
  /** 点击回调，如果提供则屏蔽预览功能 */
  onClick?: () => void
  /** 禁用预览功能 */
  noPreview?: boolean
  /** 头像大小 */
  size?: number
  /** 额外的类名 */
  className?: string
}

export const MyAvatar = (props: MyAvatarProps) => {
  const { onClick, noPreview = false, size = 64, className } = props
  const { info: user } = useUserStore()

  const avatarSrc = user?.avatar || ''
  const fallbackText = user?.username?.charAt(0).toUpperCase() || 'U'

  // 如果有 onClick 回调，包装点击事件
  if (onClick) {
    return (
      <div className={className} onClick={onClick}>
        <UserAvatar 
          src={avatarSrc}
          alt={user?.username}
          size={size}
          fallbackText={fallbackText}
          noPreview={true}
        />
      </div>
    )
  }

  // 直接使用 UserAvatar 的预览功能
  return (
    <UserAvatar 
      src={avatarSrc}
      alt={user?.username}
      size={size}
      fallbackText={fallbackText}
      noPreview={noPreview}
      className={className}
    />
  )
}