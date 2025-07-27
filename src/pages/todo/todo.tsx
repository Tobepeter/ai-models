import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTodoStore } from './todo-store'
import { notify } from '@/components/common/notify'
import { TodoItem } from './components/todo-item'
import type { TodoItem as TodoItemType } from './todo-types'

export const Todo = () => {
	const { todos, addTodo, updateTodo, deleteTodo } = useTodoStore()
	const [newTodoTitle, setNewTodoTitle] = useState('')

	const handleAddTodo = () => {
		if (newTodoTitle.trim()) {
			addTodo({
				title: newTodoTitle.trim(),
				description: '',
				priority: 1,
				due_date: null,
			})
			setNewTodoTitle('')
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleAddTodo()
		}
	}

	const handleEdit = (id: number, title: string) => {
		updateTodo(id, { title })
	}

	const handleDelete = (id: number) => {
		const todo = todos.find((t) => t.id === id)
		if (!todo) return

		// 先删除
		deleteTodo(id)

		// 显示撤销toast
		notify.success('任务已删除', {
			description: `"${todo.title}" 已被删除`,
			duration: 5000,
			action: {
				label: '撤销',
				onClick: () => {
					// 重新添加todo（保持原有的id和时间戳）
					const { todos: currentTodos, setData } = useTodoStore.getState()
					const newTodos = [todo, ...currentTodos]
					setData({ todos: newTodos })
					notify.info('任务已恢复')
				},
			},
		})
	}

	// 按创建时间倒序排列，新的在顶部
	const sortedTodos = [...todos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

	return (
		<div className="max-w-2xl mx-auto p-6 space-y-6">
			{/* 顶部大输入框 */}
			<div className="space-y-4">
				<h1 className="text-2xl font-bold text-center">Todo List</h1>
				<div className="flex gap-2">
					<Input
						placeholder="添加新任务..."
						value={newTodoTitle}
						onChange={(e) => setNewTodoTitle(e.target.value)}
						onKeyDown={handleKeyDown}
						className="text-lg h-12 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
					/>
					<div>
						<Button onClick={handleAddTodo} disabled={!newTodoTitle.trim()} className="h-12 px-6 transition-all duration-200">
							<Plus className="h-5 w-5" />
						</Button>
					</div>
				</div>
			</div>

			{/* 任务列表 */}
			<div className="space-y-3">
				{sortedTodos.length === 0 ? (
					<div className="text-center py-12 text-muted-foreground">
						<div>
							<p>暂无任务</p>
							<p className="text-sm mt-1">在上方输入框中添加你的第一个任务吧！</p>
						</div>
					</div>
				) : (
					sortedTodos.map((todo: TodoItemType) => <TodoItem key={todo.id} todo={todo} onEdit={handleEdit} onDelete={handleDelete} />)
				)}
			</div>
		</div>
	)
}
