import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTodoStore } from './todo-store'
import { notify } from '@/components/common/notify'
import { TodoItem } from './components/todo-item'
import { DragList } from '@/components/common/drag-list'
import type { TodoItem as TodoItemType } from './todo-types'
import type { DragListItem } from '@/components/common/drag-list'

export const Todo = () => {
	const { todos, addTodo, updateTodo, deleteTodo, setTodos } = useTodoStore()
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
				},
			},
		})
	}

	// 自定义渲染函数，用于 DragList 组件
	const renderTodoItem = (item: DragListItem) => {
		// 找到对应的 todo 对象
		const todo = todos.find((t) => t.id.toString() === item.id) as TodoItemType
		if (!todo) return null

		return (
			<div className="w-full">
				<TodoItem todo={todo} onEdit={handleEdit} onDelete={handleDelete} />
			</div>
		)
	}

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
						className="text-lg h-12 focus:ring-2 focus:ring-blue-500"
						maxLength={50}
					/>
					<div>
						<Button onClick={handleAddTodo} disabled={!newTodoTitle.trim()} className="h-12 px-6">
							<Plus className="h-5 w-5" />
						</Button>
					</div>
				</div>
			</div>

			{/* 任务列表 */}
			<div className="space-y-3">
				{todos.length === 0 ? (
					<div className="text-center py-12 text-muted-foreground">
						<div>
							<p>暂无任务</p>
							<p className="text-sm mt-1">在上方输入框中添加你的第一个任务吧！</p>
						</div>
					</div>
				) : (
					<DragList
						items={todos.map((todo) => ({ id: todo.id.toString(), title: todo.title }))}
						onItemsChange={(items) => {
							// 将排序后的items映射回todos数组
							const updatedTodos = items.map((item) => {
								return todos.find((t) => t.id.toString() === item.id)!
							})
							setTodos(updatedTodos)
						}}
						renderItem={renderTodoItem}
					/>
				)}
			</div>
		</div>
	)
}
