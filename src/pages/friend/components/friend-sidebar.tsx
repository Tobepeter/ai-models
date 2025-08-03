import { cn } from '@/lib/utils'
import { useFriendStore, friendStoreActions } from '../friend-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserPlus, Users } from 'lucide-react'
import { FriendList } from './friend-list'
import { FriendAddDialog } from './friend-add-dialog'
import { FriendRequestsPanel } from './friend-requests-panel'

interface FriendSidebarProps {
  className?: string
}

/**
 * 好友侧边栏组件
 */
export const FriendSidebar = ({ className }: FriendSidebarProps) => {
  const store = useFriendStore()
  
  // 未读总数
  const totalUnread = store.friends.reduce((sum, friend) => sum + friend.unread_count, 0)

  return (
    <div className={cn('w-60 border-r bg-background flex flex-col', className)}>
      {/* 头部 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">好友</h2>
          <div className="flex items-center gap-2">
            {/* 好友申请入口 */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => friendStoreActions.toggleRequestsPanel()}
            >
              <Users className="w-4 h-4" />
              {store.pending_requests_count > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center"
                >
                  {store.pending_requests_count}
                </Badge>
              )}
            </Button>
            
            {/* 添加好友 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => friendStoreActions.toggleAddDialog(true)}
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* 统计信息 */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{store.friends.length} 位好友</span>
          {totalUnread > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalUnread} 条未读
            </Badge>
          )}
        </div>
      </div>

      {/* 好友列表 */}
      <div className="flex-1 overflow-hidden">
        <FriendList />
      </div>
      
      {/* 弹窗组件 */}
      <FriendAddDialog />
      <FriendRequestsPanel />
    </div>
  )
}