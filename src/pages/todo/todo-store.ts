import type { TodoCreateRequest, TodoResponse, TodoUpdateRequest } from '@/api/swagger/generated'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { todoUtil } from './todo-util'

// 初始状态为空数组
const todoState = {
	todos: [] as TodoResponse[],
}

type TodoState = typeof todoState

interface TodoActions {
	// 基础操作
	setData: (data: Partial<TodoState>) => void
	setTodos: (todos: TodoResponse[]) => void

	// TODO 操作
	addTodo: (todo: TodoCreateRequest) => Promise<void>
	updateTodo: (id: number, updates: TodoUpdateRequest) => Promise<void>
	deleteTodo: (id: number) => Promise<void>
	toggleTodo: (id: number) => Promise<void>
	reorderTodo: (id: number, newPosition: number) => Promise<void>

	// 初始化加载
	loadTodos: () => Promise<void>

	// 重置状态
	reset: () => void
}

const stateCreator = () => {
	return combine(todoState, (set, get) => ({
		// 基础操作
		setData: (data: Partial<TodoState>) => {
			set(data)
			// 保存到持久化存储
			todoUtil.savePersist(get().todos)
		},
		setTodos: (todos: TodoResponse[]) => {
			// 确保todos按position排序
			const sortedTodos = [...todos].sort((a, b) => (a.position || 0) - (b.position || 0))
			set({ todos: sortedTodos })
			// 保存到持久化存储
			todoUtil.savePersist(sortedTodos)
		},

		// 初始化加载
		loadTodos: async () => {
			const todos = await todoUtil.load()
			const sortedTodos = [...todos].sort((a, b) => (a.position || 0) - (b.position || 0))
			set({ todos: sortedTodos })
			// 同时更新本地存储
			todoUtil.savePersist(sortedTodos)
		},

		// TODO 操作
		addTodo: async (todo: TodoCreateRequest) => {
			const currentTodos = get().todos

			// 计算新todo的position
			let newPosition = 100
			if (currentTodos.length > 0) {
				const firstPosition = currentTodos[0].position || 100
				newPosition = Math.max(firstPosition - 100, 0)
			}

			const todoWithPosition = { ...todo, position: newPosition }

			// 尝试通过API创建
			const createdTodo = await todoUtil.createTodo(todoWithPosition)

			if (createdTodo) {
				// API创建成功，使用服务器返回的数据
				const todos = [createdTodo, ...currentTodos].sort((a, b) => (a.position || 0) - (b.position || 0))
				set({ todos })
				todoUtil.savePersist(todos)
			} else {
				// API创建失败或未登录，使用本地逻辑
				const now = new Date().toISOString()
				const newTodo: TodoResponse = {
					...todoWithPosition,
					id: Date.now(),
					created_at: now,
					updated_at: now,
					description: todo.description ?? '',
					priority: todo.priority ?? 1,
					due_date: todo.due_date ?? null,
					completed: false,
				}

				const todos = [newTodo, ...currentTodos]
				set({ todos })
				todoUtil.savePersist(todos)
			}
		},

		updateTodo: async (id: number, updates: TodoUpdateRequest) => {
			// 尝试通过API更新
			const updatedTodo = await todoUtil.updateTodo(id, updates)

			if (updatedTodo) {
				// API更新成功，使用服务器返回的数据
				const todos = get()
					.todos.map((todo) => (todo.id === id ? updatedTodo : todo))
					.sort((a, b) => (a.position || 0) - (b.position || 0))

				set({ todos })
				todoUtil.savePersist(todos)
			} else {
				// API更新失败或未登录，使用本地逻辑
				const todos = get()
					.todos.map((todo) => (todo.id === id ? { ...todo, ...updates, updated_at: new Date().toISOString() } : todo))
					.sort((a, b) => (a.position || 0) - (b.position || 0))

				set({ todos })
				todoUtil.savePersist(todos)
			}
		},

		deleteTodo: async (id: number) => {
			// 尝试通过API删除
			const success = await todoUtil.deleteTodo(id)

			// 无论API是否成功，都从本地状态中删除
			const todos = get()
				.todos.filter((todo) => todo.id !== id)
				.sort((a, b) => (a.position || 0) - (b.position || 0))

			set({ todos })
			todoUtil.savePersist(todos)
		},

		toggleTodo: async (id: number) => {
			// 尝试通过API切换
			const toggledTodo = await todoUtil.toggleTodo(id)

			if (toggledTodo) {
				// API切换成功，使用服务器返回的数据
				const todos = get()
					.todos.map((todo) => (todo.id === id ? toggledTodo : todo))
					.sort((a, b) => (a.position || 0) - (b.position || 0))

				set({ todos })
				todoUtil.savePersist(todos)
			} else {
				// API切换失败或未登录，使用本地逻辑
				const todos = get()
					.todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed, updated_at: new Date().toISOString() } : todo))
					.sort((a, b) => (a.position || 0) - (b.position || 0))

				set({ todos })
				todoUtil.savePersist(todos)
			}
		},

		reorderTodo: async (id: number, newPosition: number) => {
			// 先更新本地状态
			const todos = get()
				.todos.map((todo) => (todo.id === id ? { ...todo, position: newPosition, updated_at: new Date().toISOString() } : todo))
				.sort((a, b) => (a.position || 0) - (b.position || 0))

			set({ todos })
			todoUtil.savePersist(todos)

			// 尝试通过API更新位置
			await todoUtil.updateTodo(id, { position: newPosition })
		},

		// 重置状态
		reset: () => {
			set(todoState)
			// 保存到持久化存储
			todoUtil.savePersist(todoState.todos)
		},
	}))
}

export const useTodoStore = create(stateCreator())
export type { TodoActions, TodoState }
