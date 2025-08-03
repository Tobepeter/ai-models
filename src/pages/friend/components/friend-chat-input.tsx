import { useState, useRef } from 'react'
import { useFriendStore } from '../friend-store'
import { friendMgr } from '../core/friend-mgr'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AppEmojiPicker } from '@/components/common/app-emoji-picker'
import { Send, Image, Smile, Phone, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 聊天输入框组件
 */
export const FriendChatInput = () => {
  const [message, setMessage] = useState('')
  const [isComposing, setIsComposing] = useState(false) // 处理中文输入法
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentFriend = friendMgr.getCurrentFriend()

  const handleSend = async () => {
    if (!message.trim() || !currentFriend) return

    const content = message.trim()
    setMessage('') // 清空输入框
    
    try {
      await friendMgr.sendMessage(content, currentFriend.id)
    } catch (error) {
      console.error('发送消息失败:', error)
      // 发送失败时恢复消息内容
      setMessage(content)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  // 处理表情选择
  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setMessage(prev => prev + emoji)
      return
    }

    const { selectionStart, selectionEnd } = textarea
    const newMessage = message.slice(0, selectionStart) + emoji + message.slice(selectionEnd)
    setMessage(newMessage)

    // 设置光标位置到表情后面
    setTimeout(() => {
      const newPosition = selectionStart + emoji.length
      textarea.setSelectionRange(newPosition, newPosition)
      textarea.focus()
    }, 0)
  }

  if (!currentFriend) return null

  return (
    <div className="border-t bg-background p-4" data-slot="friend-chat-input">
      {/* 工具栏 - 图片、表情、电话、视频 */}
      <div className="flex space-x-1 mb-2">
        <Button variant="ghost" size="sm" className="text-muted-foreground h-8 px-2">
          <Image className="w-4 h-4" />
        </Button>
        <AppEmojiPicker 
          onEmojiSelect={handleEmojiSelect}
          trigger={
            <Button variant="ghost" size="sm" className="text-muted-foreground h-8 px-2">
              <Smile className="w-4 h-4" />
            </Button>
          }
        />
        <Button variant="ghost" size="sm" className="text-muted-foreground h-8 px-2">
          <Phone className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground h-8 px-2">
          <Video className="w-4 h-4" />
        </Button>
      </div>

      {/* 输入区域 */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder={`给 ${currentFriend.username} 发送消息...`}
          className="min-h-[100px] max-h-40 resize-none pr-12"
          rows={4}
        />
        
        {/* 发送按钮 - 右侧底部 */}
        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          size="sm"
          className={cn(
            'absolute bottom-2 right-2 px-3 py-2',
            message.trim() 
              ? 'bg-primary hover:bg-primary/90' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}