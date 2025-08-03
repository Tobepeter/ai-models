import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { AppFriend } from '../friend-types'

interface FriendItemProps {
  friend: AppFriend
  isSelected?: boolean
  onClick?: () => void
}

/**
 * 好友项组件
 */
export const FriendItem = (props: FriendItemProps) => {
  const { friend, isSelected, onClick } = props
  // 格式化最后消息时间
  const formatLastMessageTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { locale: zhCN, addSuffix: true })
  }

  return (
    <div data-slot="friend-item"
      className={cn(
        'flex items-center p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50',
        isSelected && 'bg-accent'
      )}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="w-10 h-10">
          <AvatarImage src={friend.avatar} alt={friend.username} />
          <AvatarFallback>{friend.username[0]}</AvatarFallback>
        </Avatar>
        
        {/* 在线状态指示器 */}
        {friend.is_online && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        )}
        
        {/* 正在输入指示器 */}
        {friend.is_typing && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-background animate-pulse" />
        )}
      </div>

      <div className="flex-1 ml-3 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-medium truncate">
              {friend.username}
            </span>
            {friend.status && (
              <span className="text-xs">{friend.status}</span>
            )}
          </div>
          
          {/* 未读消息徽章 */}
          {friend.unread_count > 0 && (
            <Badge 
              variant="destructive" 
              className="ml-2 text-xs px-1.5 py-0.5 min-w-5 h-5"
            >
              {friend.unread_count > 99 ? '99+' : friend.unread_count}
            </Badge>
          )}
        </div>

        {/* 最后消息或最后在线时间 */}
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground truncate">
            {friend.last_message ? (
              friend.last_message.content
            ) : friend.is_online ? (
              '在线'
            ) : friend.last_seen ? (
              `${formatLastMessageTime(friend.last_seen)}在线`
            ) : (
              '离线'
            )}
          </p>
          
          {friend.last_message && (
            <span className="text-xs text-muted-foreground ml-2 shrink-0">
              {formatLastMessageTime(friend.last_message.created_at)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}