import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import type { TodoItem, TodoCreateRequest, TodoUpdateRequest } from './todo-types'

// 模拟数据 - 暂时写死
const mockTodos: TodoItem[] = [
	{
		id: 1,
		title: '完成项目文档',
		description: '整理项目的技术文档和用户手册',
		completed: false,
		priority: 2,
		due_date: '2025-01-30T10:00:00.000Z',
		created_at: '2025-01-25T08:00:00.000Z',
		updated_at: '2025-01-25T08:00:00.000Z',
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
	},
]

// 初始状态
const todoState = {
	todos: mockTodos,
}

type TodoState = typeof todoState

interface TodoActions {
	// 基础操作
	setData: (data: Partial<TodoState>) => void
	setTodos: (todos: TodoItem[]) => void

	// TODO 操作
	addTodo: (todo: TodoCreateRequest) => void
	updateTodo: (id: number, updates: TodoUpdateRequest) => void
	deleteTodo: (id: number) => void
	toggleTodo: (id: number) => void

	// 重置状态
	reset: () => void
}

const stateCreator = () => {
	return combine(todoState, (set, get) => ({
		// 基础操作
		setData: (data: Partial<TodoState>) => set(data),
		setTodos: (todos: TodoItem[]) => set({ todos }),

		// TODO 操作
		addTodo: (todo: TodoCreateRequest) => {
			const now = new Date().toISOString()
			const newTodo: TodoItem = {
				...todo,
				id: Date.now(), // 简单的ID生成
				created_at: now,
				updated_at: now,
				description: todo.description ?? '',
				priority: todo.priority ?? 1,
				due_date: todo.due_date ?? null,
				completed: false,
			}

			// 新增的todo添加到顶部
			const todos = [newTodo, ...get().todos]
			set({ todos })
		},

		updateTodo: (id: number, updates: TodoUpdateRequest) => {
			const todos = get().todos.map((todo) => (todo.id === id ? { ...todo, ...updates, updated_at: new Date().toISOString() } : todo))
			set({ todos })
		},

		deleteTodo: (id: number) => {
			const todos = get().todos.filter((todo) => todo.id !== id)
			set({ todos })
		},

		toggleTodo: (id: number) => {
			const todos = get().todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed, updated_at: new Date().toISOString() } : todo))
			set({ todos })
		},

		// 重置状态
		reset: () => set(todoState),
	}))
}

export const useTodoStore = create(stateCreator())
export type { TodoState, TodoActions }
