import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal } from 'lucide-react'
import type { AppFriend } from '../friend-types'

interface FriendChatHeaderProps {
  friend: AppFriend
}

/**
 * 聊天头部组件
 */
export const FriendChatHeader = (props: FriendChatHeaderProps) => {
  const { friend } = props
  return (
    <div data-slot="friend-chat-header" className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={friend.avatar} alt={friend.username} />
            <AvatarFallback>{friend.username[0]}</AvatarFallback>
          </Avatar>
          
          {/* 在线状态 */}
          {friend.is_online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{friend.username}</h3>
            {friend.status && (
              <span className="text-sm">{friend.status}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-0.5">
            {friend.is_online ? (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                在线
              </Badge>
            ) : friend.last_seen ? (
              <span className="text-xs text-muted-foreground">
                最后在线: {new Date(friend.last_seen).toLocaleTimeString()}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">离线</span>
            )}
            
            {friend.is_typing && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 animate-pulse">
                正在输入...
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}