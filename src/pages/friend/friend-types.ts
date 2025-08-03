// 基础类型定义（对应后端snake_case）
export interface FriendChatUser {
  id: string
  username: string
  avatar: string
  status?: string // 用户状态emoji
  user_profile_version: number
  is_online?: boolean // 用户在线状态
}

export interface FriendChatMsg {
  id: string
  chat_id: string
  sender_id: string
  receiver_id: string
  content: string
  msg_type: 'text' | 'image' | 'file' | 'system'
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  reply_to?: string
  created_at: string
  updated_at?: string
}

export interface FriendRequest {
  id: string
  from_user_id: string
  to_user_id: string
  from_user: FriendChatUser
  message?: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  handled_at?: string
}

export interface FriendChatSession {
  id: string
  participants: string[]
  last_message?: FriendChatMsg
  last_activity: string
  unread_count: number
  typing_status: Record<string, boolean>
}

// 前端扩展类型
export interface AppFriend extends FriendChatUser {
  last_message?: FriendChatMsg
  unread_count: number
  is_online: boolean
  last_seen?: string
  is_typing?: boolean
}

// Store状态定义
export interface FriendState {
  // 好友数据
  friends: AppFriend[]
  friend_requests: FriendRequest[]
  loading: boolean
  
  // 聊天数据  
  current_chat_id: string | null
  chat_sessions: Record<string, FriendChatSession>
  messages: Record<string, FriendChatMsg[]> // 按chat_id分组
  
  // UI状态
  selected_friend_id: string | null
  show_add_dialog: boolean
  show_requests_panel: boolean // 好友申请面板
  search_keyword: string
  
  // 实时状态
  online_users: Set<string>
  typing_status: Record<string, string> // chat_id -> user_id
  
  // 移动端状态
  is_mobile_chat_mode: boolean
  
  // 添加好友相关状态
  adding_friend_loading: boolean
  search_users_result: FriendChatUser[]
  pending_requests_count: number // 未处理申请数量
}

// API请求类型
export interface FriendSendMessageRequest {
  content: string
  msg_type: 'text' | 'image'
  receiver_id: string
}

export interface FriendMarkReadRequest {
  chat_id: string
  message_ids: string[]
}

export interface FriendAddRequest {
  user_id: string
  message?: string
}

export interface FriendRequestAction {
  request_id: string
  action: 'accept' | 'reject'
}