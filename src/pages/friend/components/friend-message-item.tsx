import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Check, CheckCheck, Clock, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { UserAvatar } from '@/components/common/user-avatar'
import type { FriendChatMsg } from '../friend-types'

interface FriendMessageItemProps {
  message: FriendChatMsg
}

/**
 * 消息项组件
 */
export const FriendMessageItem = ({ message }: FriendMessageItemProps) => {
  const isOwn = message.sender_id === 'current_user' // 临时判断，实际应该用真实用户ID
  
  // 消息状态图标
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-muted-foreground animate-spin" />
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      case 'failed':
        return <X className="w-3 h-3 text-red-500" />
      default:
        return null
    }
  }

  // 消息状态描述
  const getStatusText = () => {
    switch (message.status) {
      case 'sending': return '发送中...'
      case 'sent': return '已发送'
      case 'delivered': return '已送达'
      case 'read': return '已读'
      case 'failed': return '发送失败'
      default: return ''
    }
  }

  return (
    <div className={cn('flex gap-3', isOwn && 'flex-row-reverse')}>
      {/* 头像 */}
      {!isOwn && (
        <UserAvatar 
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=friend"
          fallbackText="F"
          size={32}
          className="shrink-0"
        />
      )}

      <div className={cn('flex flex-col gap-1 max-w-[70%]', isOwn && 'items-end')}>
        {/* 消息内容 */}
        <div
          className={cn(
            'px-3 py-2 rounded-lg break-words',
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted',
            message.status === 'failed' && 'bg-red-100 text-red-800 border border-red-200'
          )}
        >
          {message.msg_type === 'text' && (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
          
          {message.msg_type === 'image' && (
            <div className="space-y-2">
              <img 
                src={message.content} 
                alt="图片消息" 
                className="max-w-full rounded-md"
              />
            </div>
          )}
          
          {message.msg_type === 'system' && (
            <p className="text-xs text-center italic text-muted-foreground">
              {message.content}
            </p>
          )}
        </div>

        {/* 消息元信息 */}
        <div className={cn('flex items-center gap-1 text-xs text-muted-foreground', isOwn && 'flex-row-reverse')}>
          <span>
            {formatDistanceToNow(message.created_at, { locale: zhCN, addSuffix: true })}
          </span>
          
          {/* 自己的消息显示状态 */}
          {isOwn && (
            <>
              {getStatusIcon()}
              {message.status === 'failed' && (
                <Badge variant="destructive" className="text-xs px-1 py-0">
                  {getStatusText()}
                </Badge>
              )}
            </>
          )}
        </div>

        {/* 回复消息引用 */}
        {message.reply_to && (
          <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded border-l-2 border-primary">
            回复: {message.reply_to}
          </div>
        )}
      </div>
    </div>
  )
}