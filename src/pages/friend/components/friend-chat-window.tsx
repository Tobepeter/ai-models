import { useFriendStore } from '../friend-store'
import { friendMgr } from '../core/friend-mgr'
import { FriendChatHeader } from './friend-chat-header'
import { FriendChatMessages } from './friend-chat-messages'
import { FriendChatInput } from './friend-chat-input'

/**
 * 好友聊天窗口组件
 */
export const FriendChatWindow = () => {
  const store = useFriendStore()
  const currentFriend = friendMgr.getCurrentFriend()

  if (!currentFriend) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center text-muted-foreground">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium mb-2">选择一个好友开始聊天</h3>
          <p className="text-sm">从左侧好友列表选择一位好友，开始你们的对话</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* 聊天头部 */}
      <FriendChatHeader friend={currentFriend} />
      
      {/* 消息列表 */}
      <div className="flex-1 overflow-hidden">
        <FriendChatMessages />
      </div>
      
      {/* 输入框 */}
      <FriendChatInput />
    </div>
  )
}