export interface TodoItem {
  id: number
  title: string
  description: string
  completed: boolean
  priority: number
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TodoCreateRequest {
  title: string
  description?: string
  priority?: number
  due_date?: string | null
}

export interface TodoUpdateRequest {
  title?: string
  description?: string
  completed?: boolean
  priority?: number
  due_date?: string | null
}

export interface TodoStats {
  total: number
  completed: number
  pending: number
  high_priority: number
  overdue: number
}

export type TodoFilter = 'all' | 'active' | 'completed'
export type TodoSort = 'created' | 'priority' | 'due_date' | 'title'

export interface TodoDialogState {
  showCreate: boolean
  showEdit: boolean
  showDelete: boolean
  editingTodo: TodoItem | null
}