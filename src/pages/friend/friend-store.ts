import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import type { FriendState, AppFriend, FriendRequest, FriendChatMsg, FriendChatSession } from './friend-types'

/**
 * 好友模块状态管理
 */
export const useFriendStore = create<FriendState>()(
  persist(
    immer((set, get) => ({
      // 好友数据
      friends: [],
      friend_requests: [],
      loading: false,
      
      // 聊天数据
      current_chat_id: null,
      chat_sessions: {},
      messages: {},
      
      // UI状态
      selected_friend_id: null,
      show_add_dialog: false,
      show_requests_panel: false,
      search_keyword: '',
      
      // 实时状态
      online_users: new Set(),
      typing_status: {},
      
      // 移动端状态
      is_mobile_chat_mode: false,
      
      // 添加好友相关状态
      adding_friend_loading: false,
      search_users_result: [],
      pending_requests_count: 0,
    })),
    {
      name: 'friend-store',
      partialize: (state) => ({
        friends: state.friends,
        chat_sessions: state.chat_sessions,
        messages: state.messages,
      }),
    }
  )
)

// Store Actions
export const friendStoreActions = {
  // 基础设置
  setLoading: (loading: boolean) => {
    useFriendStore.setState({ loading })
  },

  setFriends: (friends: AppFriend[]) => {
    useFriendStore.setState({ friends })
  },

  // 好友选择
  selectFriend: (friendId: string | null) => {
    useFriendStore.setState((state) => {
      state.selected_friend_id = friendId
      if (friendId) {
        state.current_chat_id = `chat_${friendId}` // 简单生成chatId
        // 移动端进入聊天模式
        if (state.is_mobile_chat_mode !== undefined) {
          state.is_mobile_chat_mode = true
        }
      }
    })
  },

  // 弹窗控制
  toggleAddDialog: (show?: boolean) => {
    useFriendStore.setState((state) => {
      state.show_add_dialog = show ?? !state.show_add_dialog
    })
  },

  toggleRequestsPanel: (show?: boolean) => {
    useFriendStore.setState((state) => {
      state.show_requests_panel = show ?? !state.show_requests_panel
    })
  },

  // 消息管理
  addMessage: (chatId: string, message: FriendChatMsg) => {
    useFriendStore.setState((state) => {
      if (!state.messages[chatId]) {
        state.messages[chatId] = []
      }
      state.messages[chatId].push(message)
    })
  },

  updateMessage: (chatId: string, messageId: string, updates: Partial<FriendChatMsg>) => {
    useFriendStore.setState((state) => {
      const messages = state.messages[chatId]
      if (messages) {
        const index = messages.findIndex(m => m.id === messageId)
        if (index !== -1) {
          Object.assign(messages[index], updates)
        }
      }
    })
  },

  // 在线状态
  setUserOnline: (userId: string, isOnline: boolean) => {
    useFriendStore.setState((state) => {
      if (isOnline) {
        state.online_users.add(userId)
      } else {
        state.online_users.delete(userId)
      }
      
      // 更新好友列表中的在线状态
      const friend = state.friends.find(f => f.id === userId)
      if (friend) {
        friend.is_online = isOnline
        if (!isOnline) {
          friend.last_seen = new Date()
        }
      }
    })
  },

  // 移动端模式切换
  setMobileChatMode: (enabled: boolean) => {
    useFriendStore.setState({ is_mobile_chat_mode: enabled })
  },

  // 搜索用户结果
  setSearchUsersResult: (users: AppFriend[]) => {
    useFriendStore.setState({ search_users_result: users })
  },

  // 重置状态
  reset: () => {
    useFriendStore.setState((state) => {
      state.selected_friend_id = null
      state.current_chat_id = null
      state.show_add_dialog = false
      state.show_requests_panel = false
      state.search_keyword = ''
      state.is_mobile_chat_mode = false
      state.adding_friend_loading = false
      state.search_users_result = []
    })
  },
}