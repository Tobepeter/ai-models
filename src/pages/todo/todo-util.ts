import { storageKeys } from '@/utils/storage'
import { useUserStore } from '@/store/user-store'
import { api } from '@/api/api'
import type { TodoResponse, TodoCreateRequest, TodoUpdateRequest, GetTodoListParams } from '@/api/swagger/generated'

// 模拟数据
const mockTodos: TodoResponse[] = [
	{
		id: 1,
		title: '完成项目文档',
		description: '整理项目的技术文档和用户手册',
		completed: false,
		priority: 2,
		due_date: '2025-01-30T10:00:00.000Z',
		created_at: '2025-01-25T08:00:00.000Z',
		updated_at: '2025-01-25T08:00:00.000Z',
		position: 1,
	},
	{
		id: 2,
		title: '学习新技术',
		description: '深入学习 React 18 的新特性',
		completed: true,
		priority: 1,
		due_date: null,
		created_at: '2025-01-24T14:30:00.000Z',
		updated_at: '2025-01-25T09:15:00.000Z',
		position: 2,
	},
	{
		id: 3,
		title: '修复线上bug',
		description: '解决用户反馈的登录问题',
		completed: false,
		priority: 3,
		due_date: '2025-01-28T18:00:00.000Z',
		created_at: '2025-01-25T10:45:00.000Z',
		updated_at: '2025-01-25T10:45:00.000Z',
		position: 3,
	},
]

class TodoUtil {
	/* 检查用户是否已登录 */
	private isLoggedIn() {
		const { token, info } = useUserStore.getState()
		return !!(token && info && info.username !== 'anonymous')
	}

	/* 从localStorage中加载待办事项数据，如果没有存储数据则使用模拟数据 */
	loadPersist(): TodoResponse[] {
		try {
			const storedData = localStorage.getItem(storageKeys.todo)
			if (storedData) {
				const parsedData = JSON.parse(storedData)
				if (Array.isArray(parsedData)) {
					return parsedData
				}
			}
			return mockTodos
		} catch (error) {
			console.warn('[TodoUtil] Failed to load persisted todos:', error)
			return mockTodos
		}
	}

	/* 保存待办事项数据到localStorage */
	savePersist(todos: TodoResponse[]) {
		try {
			localStorage.setItem(storageKeys.todo, JSON.stringify(todos))
		} catch (error) {
			console.error('[TodoUtil] Failed to save todos:', error)
		}
	}

	/* 加载todos，优先从服务器获取，失败时回退到本地存储 */
	async load(): Promise<TodoResponse[]> {
		if (!this.isLoggedIn()) {
			return this.loadPersist()
		}

		try {
			const response = await api.todos.getTodoList({})
			if (response?.data?.data && Array.isArray(response.data.data)) {
				return response.data.data
			}
			return []
		} catch (error) {
			console.error('[TodoUtil] Failed to load todos from server:', error)
			return this.loadPersist()
		}
	}

	/* 创建todo（如果用户已登录则发送到服务器） */
	async createTodo(todo: TodoCreateRequest): Promise<TodoResponse | null> {
		if (!this.isLoggedIn()) {
			return null
		}

		try {
			const response = await api.todos.createTodo(todo)
			if (response?.data) {
				return response.data
			}
			return null
		} catch (error) {
			console.error('[TodoUtil] Failed to create todo:', error)
			return null
		}
	}

	/* 更新todo（如果用户已登录则发送到服务器） */
	async updateTodo(id: number, updates: TodoUpdateRequest): Promise<TodoResponse | null> {
		if (!this.isLoggedIn()) {
			return null
		}

		try {
			const response = await api.todos.updateTodo(id.toString(), updates)
			if (response?.data) {
				return response.data
			}
			return null
		} catch (error) {
			console.error('[TodoUtil] Failed to update todo:', error)
			return null
		}
	}

	/* 删除todo（如果用户已登录则发送到服务器） */
	async deleteTodo(id: number): Promise<boolean> {
		if (!this.isLoggedIn()) {
			return false
		}

		try {
			const response = await api.todos.deleteTodo(id.toString())
			return !!response
		} catch (error) {
			console.error('[TodoUtil] Failed to delete todo:', error)
			return false
		}
	}

	/* 切换todo完成状态（如果用户已登录则发送到服务器） */
	async toggleTodo(id: number): Promise<TodoResponse | null> {
		if (!this.isLoggedIn()) {
			return null
		}

		try {
			const response = await api.todos.toggleTodoComplete(id.toString())
			if (response?.data) {
				return response.data
			}
			return null
		} catch (error) {
			console.error('[TodoUtil] Failed to toggle todo:', error)
			return null
		}
	}
}

export const todoUtil = new TodoUtil()
