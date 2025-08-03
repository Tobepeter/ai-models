import { useIsMobile } from '@/hooks/use-mobile'
import { useFriendStore, friendStoreActions } from './friend-store'
import { FriendSidebar } from './components/friend-sidebar'
import { FriendChatWindow } from './components/friend-chat-window'
import { FriendMobileChatPage } from './components/mobile/friend-mobile-chat'

/**
 * 好友模块主页面
 */
export const Friend = () => {
  const isMobile = useIsMobile()
  const store = useFriendStore()

  // 移动端逻辑
  if (isMobile) {
    // 移动端聊天模式：显示聊天页面
    if (store.is_mobile_chat_mode && store.selected_friend_id) {
      return <FriendMobileChatPage friendId={store.selected_friend_id} />
    }
    
    // 移动端默认：显示好友列表
    return (
      <div className="h-full">
        <FriendSidebar className="w-full border-r-0" />
      </div>
    )
  }

  // PC端：三栏布局
  return (
    <div className="flex h-full">
      <FriendSidebar />
      <FriendChatWindow />
    </div>
  )
}