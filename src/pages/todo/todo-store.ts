import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import type { TodoResponse, TodoCreateRequest, TodoUpdateRequest } from '@/api/types/generated'
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
	addTodo: (todo: TodoCreateRequest) => void
	updateTodo: (id: number, updates: TodoUpdateRequest) => void
	deleteTodo: (id: number) => void
	toggleTodo: (id: number) => void
	reorderTodo: (id: number, newPosition: number) => void

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
			const sortedTodos = [...todos].sort((a, b) => (a.position || 0) - (b.position || 0));
			set({ todos: sortedTodos })
			// 保存到持久化存储
			todoUtil.savePersist(sortedTodos)
		},

		// TODO 操作
		addTodo: (todo: TodoCreateRequest) => {
			const now = new Date().toISOString()
			const currentTodos = get().todos;
			
			// 计算新todo的position
			let newPosition = 100;
			if (currentTodos.length > 0) {
				// 添加到顶部，位置为第一个元素位置减去100
				const firstPosition = currentTodos[0].position || 100;
				newPosition = Math.max(firstPosition - 100, 0); // 确保不小于0
			}
			
			const newTodo: TodoResponse = {
				...todo,
				id: Date.now(), // 简单的ID生成
				created_at: now,
				updated_at: now,
				description: todo.description ?? '',
				priority: todo.priority ?? 1,
				due_date: todo.due_date ?? null,
				completed: false,
				position: newPosition,
			}

			// 新增的todo添加到数组并保持排序
			const todos = [newTodo, ...currentTodos];
			set({ todos })
			// 保存到持久化存储
			todoUtil.savePersist(todos)
		},

		updateTodo: (id: number, updates: TodoUpdateRequest) => {
			const todos = get().todos.map((todo) => 
				todo.id === id ? { ...todo, ...updates, updated_at: new Date().toISOString() } : todo
			).sort((a, b) => (a.position || 0) - (b.position || 0));
			
			set({ todos })
			// 保存到持久化存储
			todoUtil.savePersist(todos)
		},

		deleteTodo: (id: number) => {
			const todos = get().todos.filter((todo) => todo.id !== id)
				.sort((a, b) => (a.position || 0) - (b.position || 0));
				
			set({ todos })
			// 保存到持久化存储
			todoUtil.savePersist(todos)
		},

		toggleTodo: (id: number) => {
			const todos = get().todos.map((todo) => 
				todo.id === id ? { ...todo, completed: !todo.completed, updated_at: new Date().toISOString() } : todo
			).sort((a, b) => (a.position || 0) - (b.position || 0));
			
			set({ todos })
			// 保存到持久化存储
			todoUtil.savePersist(todos)
		},

		reorderTodo: (id: number, newPosition: number) => {
			const todos = get().todos.map((todo) => 
				todo.id === id ? { ...todo, position: newPosition, updated_at: new Date().toISOString() } : todo
			).sort((a, b) => (a.position || 0) - (b.position || 0));
			
			set({ todos })
			// 保存到持久化存储
			todoUtil.savePersist(todos)
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
export type { TodoState, TodoActions }
