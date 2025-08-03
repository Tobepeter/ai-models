import { useFriendStore, friendStoreActions } from '../../friend-store'
import { friendMgr } from '../../core/friend-mgr'
import { FriendChatHeader } from '../friend-chat-header'
import { FriendChatMessages } from '../friend-chat-messages'
import { FriendChatInput } from '../friend-chat-input'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface FriendMobileChatPageProps {
  friendId: string
}

/**
 * 移动端聊天页面
 */
export const FriendMobileChatPage = (props: FriendMobileChatPageProps) => {
  const { friendId } = props
  const currentFriend = friendMgr.getCurrentFriend()

  const handleBack = () => {
    friendStoreActions.setMobileChatMode(false)
    friendStoreActions.selectFriend(null)
  }

  if (!currentFriend) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>好友不存在</p>
          <Button variant="outline" onClick={handleBack} className="mt-2">
            返回好友列表
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div data-slot="friend-mobile-chat-page" className="h-full flex flex-col">
      {/* 移动端头部（包含返回按钮） */}
      <div className="flex items-center p-4 border-b bg-background">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <FriendChatHeader friend={currentFriend} />
        </div>
      </div>
      
      {/* 消息列表 */}
      <div className="flex-1 overflow-hidden">
        <FriendChatMessages />
      </div>
      
      {/* 输入框 */}
      <FriendChatInput />
    </div>
  )
}