import { useFriendStore, friendStoreActions } from '../friend-store'
import { friendMgr } from '../core/friend-mgr'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Check, X, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * 好友申请面板组件
 */
export const FriendRequestsPanel = () => {
  const store = useFriendStore()

  // Mock数据
  const mockRequests = [
    {
      id: '1',
      from_user_id: 'user1',
      to_user_id: 'current_user',
      from_user: {
        id: 'user1',
        username: 'David',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        user_profile_version: 1,
      },
      message: '我们在公司见过，想和你交个朋友',
      status: 'pending' as const,
      created_at: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
    },
    {
      id: '2',
      from_user_id: 'user2',
      to_user_id: 'current_user',
      from_user: {
        id: 'user2',
        username: 'Emma',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
        user_profile_version: 1,
      },
      status: 'pending' as const,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
    }
  ]

  const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      await friendMgr.handleFriendRequest(requestId, action)
      // TODO: 从列表中移除已处理的申请
    } catch (error) {
      console.error('处理好友申请失败:', error)
    }
  }

  const handleClose = () => {
    friendStoreActions.toggleRequestsPanel(false)
  }

  return (
    <Sheet open={store.show_requests_panel} onOpenChange={handleClose}>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            好友申请
            {mockRequests.length > 0 && (
              <Badge variant="secondary">
                {mockRequests.length} 条待处理
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            处理收到的好友申请
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {mockRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p>暂无好友申请</p>
              <p className="text-sm">收到新申请时会在这里显示</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4">
                {mockRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    {/* 申请人信息 */}
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={request.from_user.avatar} alt={request.from_user.username} />
                        <AvatarFallback>{request.from_user.username[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{request.from_user.username}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(request.created_at, { locale: zhCN, addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* 申请留言 */}
                    {request.message && (
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm">{request.message}</p>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleRequest(request.id, 'accept')}
                          className="flex-1"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          接受
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequest(request.id, 'reject')}
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-1" />
                          拒绝
                        </Button>
                      </div>
                    )}

                    {/* 已处理状态 */}
                    {request.status !== 'pending' && (
                      <div className="text-center py-2">
                        <Badge 
                          variant={request.status === 'accepted' ? 'default' : 'secondary'}
                        >
                          {request.status === 'accepted' ? '已接受' : '已拒绝'}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}