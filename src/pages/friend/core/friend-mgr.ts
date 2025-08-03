import { useFriendStore, friendStoreActions } from '../friend-store'
import type { AppFriend, FriendChatMsg, FriendRequest } from '../friend-types'

/**
 * 好友管理器 - 处理好友和聊天相关业务逻辑
 */
class FriendMgr {
  mockMode = true // 暂时使用mock模式

  private getStore() {
    return useFriendStore.getState()
  }

  // 初始化好友数据
  async loadFriends() {
    try {
      friendStoreActions.setLoading(true)
      
      if (this.mockMode) {
        // Mock数据
        const mockFriends: AppFriend[] = [
          {
            id: '1',
            username: 'Alice',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
            status: '😊',
            user_profile_version: 1,
            last_message: {
              id: 'msg1',
              chat_id: 'chat_1',
              sender_id: '1',
              receiver_id: 'current_user',
              content: '今天天气不错呢',
              msg_type: 'text',
              status: 'read',
              created_at: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
            },
            unread_count: 0,
            is_online: true,
          },
          {
            id: '2', 
            username: 'Bob',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
            status: '🎮',
            user_profile_version: 1,
            last_message: {
              id: 'msg2',
              chat_id: 'chat_2',
              sender_id: '2',
              receiver_id: 'current_user',
              content: '一起打游戏吗？',
              msg_type: 'text',
              status: 'delivered',
              created_at: new Date(Date.now() - 1000 * 60 * 10), // 10分钟前
            },
            unread_count: 2,
            is_online: false,
            last_seen: new Date(Date.now() - 1000 * 60 * 5), // 5分钟前离线
          },
          {
            id: '3',
            username: 'Charlie',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
            user_profile_version: 1,
            unread_count: 0,
            is_online: true,
          }
        ]
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        
        friendStoreActions.setFriends(mockFriends)
        console.log('[FriendMgr] Mock加载好友数据成功')
      } else {
        // TODO: 真实API调用
        // const friends = await api.friend.getFriends()
        // friendStoreActions.setFriends(friends)
      }
    } catch (error) {
      console.error('[FriendMgr] 加载好友数据失败:', error)
    } finally {
      friendStoreActions.setLoading(false)
    }
  }

  // 发送消息
  async sendMessage(content: string, receiverId: string) {
    if (!content.trim()) return

    const chatId = `chat_${receiverId}`
    const tempMessage: FriendChatMsg = {
      id: `temp_${Date.now()}`,
      chat_id: chatId,
      sender_id: 'current_user',
      receiver_id: receiverId,
      content: content.trim(),
      msg_type: 'text',
      status: 'sending',
      created_at: new Date(),
    }

    // 乐观更新
    friendStoreActions.addMessage(chatId, tempMessage)

    try {
      if (this.mockMode) {
        // 模拟发送延迟
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // 更新消息状态
        friendStoreActions.updateMessage(chatId, tempMessage.id, {
          id: `msg_${Date.now()}`,
          status: 'sent',
        })
        
        console.log('[FriendMgr] Mock发送消息成功')
      } else {
        // TODO: 真实API调用
        // const response = await api.friend.sendMessage({
        //   content,
        //   msg_type: 'text',
        //   receiver_id: receiverId,
        // })
        // friendStoreActions.updateMessage(chatId, tempMessage.id, response)
      }
    } catch (error) {
      console.error('[FriendMgr] 发送消息失败:', error)
      friendStoreActions.updateMessage(chatId, tempMessage.id, { status: 'failed' })
    }
  }

  // 搜索用户
  async searchUsers(keyword: string) {
    if (!keyword.trim()) {
      friendStoreActions.setSearchUsersResult([])
      return
    }

    try {
      if (this.mockMode) {
        // Mock搜索结果
        const mockUsers: AppFriend[] = [
          {
            id: 'search_1',
            username: `${keyword}_user1`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${keyword}1`,
            user_profile_version: 1,
            unread_count: 0,
            is_online: true,
          },
          {
            id: 'search_2',
            username: `${keyword}_user2`, 
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${keyword}2`,
            user_profile_version: 1,
            unread_count: 0,
            is_online: false,
          }
        ]
        
        await new Promise(resolve => setTimeout(resolve, 300))
        friendStoreActions.setSearchUsersResult(mockUsers)
        console.log('[FriendMgr] Mock搜索用户成功')
      } else {
        // TODO: 真实API调用
        // const users = await api.friend.searchUsers(keyword)
        // friendStoreActions.setSearchUsersResult(users)
      }
    } catch (error) {
      console.error('[FriendMgr] 搜索用户失败:', error)
    }
  }

  // 发送好友申请
  async sendFriendRequest(userId: string, message?: string) {
    try {
      friendStoreActions.toggleAddDialog(false) // 关闭添加弹窗
      
      if (this.mockMode) {
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log('[FriendMgr] Mock发送好友申请成功')
        // TODO: 显示成功提示
      } else {
        // TODO: 真实API调用
        // await api.friend.sendFriendRequest(userId, message)
      }
    } catch (error) {
      console.error('[FriendMgr] 发送好友申请失败:', error)
    }
  }

  // 处理好友申请
  async handleFriendRequest(requestId: string, action: 'accept' | 'reject') {
    try {
      if (this.mockMode) {
        await new Promise(resolve => setTimeout(resolve, 300))
        console.log(`[FriendMgr] Mock${action === 'accept' ? '接受' : '拒绝'}好友申请成功`)
        // TODO: 更新申请列表状态
      } else {
        // TODO: 真实API调用
        // await api.friend.handleFriendRequest(requestId, action)
      }
    } catch (error) {
      console.error(`[FriendMgr] 处理好友申请失败:`, error)
    }
  }

  // 获取当前选中好友的消息
  getCurrentMessages(): FriendChatMsg[] {
    const store = this.getStore()
    if (!store.current_chat_id) return []
    return store.messages[store.current_chat_id] || []
  }

  // 获取当前选中的好友
  getCurrentFriend(): AppFriend | null {
    const store = this.getStore()
    if (!store.selected_friend_id) return null
    return store.friends.find(f => f.id === store.selected_friend_id) || null
  }
}

export const friendMgr = new FriendMgr()