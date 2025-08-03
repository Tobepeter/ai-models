import { useRef, useEffect } from 'react'
import { friendMgr } from '../core/friend-mgr'
import { FriendMessageItem } from './friend-message-item'
import { ScrollArea } from '@/components/ui/scroll-area'

/**
 * 聊天消息列表组件
 */
export const FriendChatMessages = () => {
  const messages = friendMgr.getCurrentMessages()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 新消息时滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-2">🗨️</div>
          <p>还没有消息</p>
          <p className="text-sm">发送第一条消息开始对话</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
      <div className="space-y-4">
        {messages.map((message) => (
          <FriendMessageItem key={message.id} message={message} />
        ))}
      </div>
    </ScrollArea>
  )
}