import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, CheckSquare } from 'lucide-react'
import { useState } from 'react'
import { useMount } from 'ahooks'
import { useTodoStore } from './todo-store'
import { useUserStore } from '@/store/user-store'
import { notify } from '@/components/common/notify'
import { TodoItem } from './components/todo-item'
import { DragList } from '@/components/common/drag-list'
import type { TodoResponse } from '@/api/swagger/generated'
import type { DragListItem } from '@/components/common/drag-list'
import { todoUtil } from './todo-util'

export const Todo = () => {
	const { todos, addTodo, updateTodo, deleteTodo, loadTodos, toggleTodo, reorderTodo } = useTodoStore()
	const { token, info: user } = useUserStore()
	const [newTodoTitle, setNewTodoTitle] = useState('')

	// 判断是否已登录
	const isLoggedIn = token && user && user.username !== 'anonymous'

	useMount(() => {
		// 组件挂载时加载数据（优先从服务器加载）
		loadTodos()
	})

	const handleAddTodo = async () => {
		if (newTodoTitle.trim()) {
			await addTodo({
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

	const handleEdit = async (id: number, title: string) => {
		await updateTodo(id, { title })
	}

	const handleDelete = async (id: number) => {
		const todo = todos.find((t) => t.id === id)
		if (!todo) return

		// 先删除
		await deleteTodo(id)

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
		const todo = todos.find((t) => t.id?.toString() === item.id)
		if (!todo) return null

		return (
			<div className="w-full">
				<TodoItem todo={todo} onEdit={handleEdit} onDelete={handleDelete} />
			</div>
		)
	}

	// 计算插入位置
	const calculateInsertPosition = (fromIndex: number, toIndex: number) => {
		const todosArray = [...todos]

		// 如果移动到顶部
		if (toIndex === 0) {
			const firstPosition = todosArray[0]?.position || 100
			return Math.max(firstPosition - 100, 0)
		}

		// 如果移动到底部
		if (toIndex >= todosArray.length) {
			const lastPosition = todosArray[todosArray.length - 1]?.position || 100
			return lastPosition + 100
		}

		// 如果移动到中间
		const prevPosition = todosArray[toIndex - 1]?.position || 0
		const nextPosition = todosArray[toIndex]?.position || 100
		return (prevPosition + nextPosition) / 2
	}

	return (
		<div className="max-w-2xl mx-auto p-6 space-y-6">
			{/* 顶部大输入框 */}
			<div className="space-y-4">
				{!isLoggedIn && <p className="text-sm text-muted-foreground text-center">你可以登录后数据持久化</p>}
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
						<div className="flex flex-col items-center space-y-3">
							<CheckSquare className="h-16 w-16 text-muted-foreground/40" />
							<div>
								<p className="text-lg font-medium">暂无任务</p>
								<p className="text-sm mt-1">在上方输入框中添加你的第一个任务吧！</p>
							</div>
						</div>
					</div>
				) : (
					<DragList
						items={todos.map((todo) => ({ id: todo.id?.toString() || '', title: todo.title }))}
						onItemMove={async (fromIndex, toIndex) => {
							// 获取被移动的todo
							const movedTodo = todos[fromIndex]
							if (!movedTodo) return

							// 计算新位置
							const newPosition = calculateInsertPosition(fromIndex, toIndex)

							// 更新位置
							await reorderTodo(movedTodo.id!, newPosition)
						}}
						renderItem={renderTodoItem}
					/>
				)}
			</div>
		</div>
	)
}
