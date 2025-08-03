import { useFriendStore, friendStoreActions } from '../friend-store'
import { friendMgr } from '../core/friend-mgr'
import { useMount } from 'ahooks'
import { FriendItem } from './friend-item'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * 好友列表组件
 */
export const FriendList = () => {
  const store = useFriendStore()
  
  // 初始化数据
  useMount(() => {
    if (store.friends.length === 0) {
      friendMgr.loadFriends()
    }
  })

  if (store.loading && store.friends.length === 0) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (store.friends.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <div className="text-4xl mb-2">👥</div>
        <p>还没有好友</p>
        <p className="text-sm">点击右上角添加好友</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2">
        {store.friends.map((friend) => (
          <FriendItem 
            key={friend.id} 
            friend={friend}
            isSelected={store.selected_friend_id === friend.id}
            onClick={() => friendStoreActions.selectFriend(friend.id)}
          />
        ))}
      </div>
    </ScrollArea>
  )
}