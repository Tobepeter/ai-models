import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTodoStore } from './todo-store'
import { notify } from '@/components/common/notify'

/** 简单的todo项组件 */
const TodoItem = ({ todo, onEdit, onDelete }: { todo: any; onEdit: (id: number, title: string) => void; onDelete: (id: number) => void }) => {
	const { toggleTodo } = useTodoStore()
	const [isEditing, setIsEditing] = useState(false)
	const [editTitle, setEditTitle] = useState(todo.title)
	const [justCompleted, setJustCompleted] = useState(false)

	const handleEdit = () => {
		setIsEditing(true)
	}

	const handleSave = () => {
		if (editTitle.trim()) {
			onEdit(todo.id, editTitle.trim())
		}
		setIsEditing(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSave()
		} else if (e.key === 'Escape') {
			setEditTitle(todo.title)
			setIsEditing(false)
		}
	}

	const handleToggle = () => {
		if (!todo.completed) {
			// 如果是从未完成变为完成，显示庆祝动画
			setJustCompleted(true)
			setTimeout(() => setJustCompleted(false), 600)
		}
		toggleTodo(todo.id)
	}

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: -20, scale: 0.95 }}
			animate={{
				opacity: 1,
				y: 0,
				scale: justCompleted ? [1, 1.05, 1] : 1,
				backgroundColor: justCompleted ? ["#ffffff", "#f0f9ff", "#ffffff"] : "#ffffff"
			}}
			exit={{ opacity: 0, y: -20, scale: 0.95 }}
			transition={{
				type: "spring",
				stiffness: 500,
				damping: 30,
				layout: { duration: 0.3 },
				scale: { duration: 0.6 },
				backgroundColor: { duration: 0.6 }
			}}
			whileHover={{ scale: 1.02 }}
			className="group flex items-center gap-3 p-4 bg-white border rounded-lg hover:shadow-md transition-all duration-200"
		>
			{/* 完成按钮 */}
			<motion.div
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
				animate={justCompleted ? { rotate: [0, 10, -10, 0] } : {}}
				transition={{ duration: 0.6 }}
			>
				<Checkbox
					checked={todo.completed}
					onCheckedChange={handleToggle}
					className="transition-all duration-200"
				/>
			</motion.div>

			{/* 标题 */}
			<div className="flex-1">
				{isEditing ? (
					<Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown} className="h-8 text-sm" autoFocus />
				) : (
					<div className="flex items-center gap-2">
						<span className={cn('text-sm', todo.completed && 'line-through text-muted-foreground')}>{todo.title}</span>
						{justCompleted && (
							<motion.span
								initial={{ opacity: 0, scale: 0, y: 0 }}
								animate={{ opacity: 1, scale: 1, y: -10 }}
								exit={{ opacity: 0, scale: 0, y: -20 }}
								transition={{ duration: 0.6 }}
								className="text-yellow-500"
							>
								✨
							</motion.span>
						)}
						<motion.div
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
						>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleEdit}
								className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-50"
							>
								<Edit className="h-3 w-3" />
							</Button>
						</motion.div>
					</div>
				)}
			</div>

			{/* 删除按钮 */}
			<motion.div
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
			>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onDelete(todo.id)}
					className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</motion.div>
		</motion.div>
	)
}

export const Todo = () => {
	const { todos, addTodo, updateTodo, deleteTodo } = useTodoStore()
	const [newTodoTitle, setNewTodoTitle] = useState('')

	const handleAddTodo = () => {
		if (newTodoTitle.trim()) {
			addTodo({
				title: newTodoTitle.trim(),
				description: '',
				completed: false,
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
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ type: "spring", stiffness: 400, damping: 25 }}
				className="space-y-4"
			>
				<motion.h1
					className="text-2xl font-bold text-center"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
				>
					Todo List
				</motion.h1>
				<motion.div
					className="flex gap-2"
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.15, type: "spring" }}
				>
					<Input
						placeholder="添加新任务..."
						value={newTodoTitle}
						onChange={(e) => setNewTodoTitle(e.target.value)}
						onKeyDown={handleKeyDown}
						className="text-lg h-12 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
					/>
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<Button
							onClick={handleAddTodo}
							disabled={!newTodoTitle.trim()}
							className="h-12 px-6 transition-all duration-200"
						>
							<Plus className="h-5 w-5" />
						</Button>
					</motion.div>
				</motion.div>
			</motion.div>

			{/* 任务列表 */}
			<motion.div
				className="space-y-3"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
			>
				<AnimatePresence mode="popLayout">
					{sortedTodos.length === 0 ? (
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.3, type: "spring" }}
							className="text-center py-12 text-muted-foreground"
						>
							<motion.div
								initial={{ y: 10 }}
								animate={{ y: 0 }}
								transition={{ delay: 0.4 }}
							>
								<p>暂无任务</p>
								<p className="text-sm mt-1">在上方输入框中添加你的第一个任务吧！</p>
							</motion.div>
						</motion.div>
					) : (
						sortedTodos.map((todo) => (
							<TodoItem key={todo.id} todo={todo} onEdit={handleEdit} onDelete={handleDelete} />
						))
					)}
				</AnimatePresence>
			</motion.div>
		</div>
	)
}
