import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTodoStore } from '@/pages/todo/todo-store'
import type { TodoItem as TodoItemType } from '@/pages/todo/todo-types'

export interface TodoItemProps {
	todo: TodoItemType
	onEdit?: (id: number, title: string) => void
	onDelete?: (id: number) => void
}

/** 简单的todo项组件 */
export const TodoItem = (props: TodoItemProps) => {
	const { todo, onEdit, onDelete } = props
	const { toggleTodo } = useTodoStore()
	const [isEditing, setIsEditing] = useState(false)
	const [editTitle, setEditTitle] = useState(todo.title)
	const [justCompleted, setJustCompleted] = useState(false)

	const handleEdit = () => {
		setIsEditing(true)
	}

	const handleSave = () => {
		if (editTitle.trim() && onEdit) {
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
		<div className="group flex items-center gap-3 p-4 bg-background border rounded-lg hover:shadow-md transition-all duration-200">
			{/* 完成按钮 */}
			<div>
				<Checkbox checked={todo.completed} onCheckedChange={handleToggle} className="transition-all duration-200" />
			</div>

			{/* 标题 */}
			<div className="flex-1">
				{isEditing ? (
					<Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown} className="h-8 text-sm" autoFocus />
				) : (
					<div className="flex items-center gap-2">
						<span className={cn('text-sm', todo.completed && 'line-through text-muted-foreground')}>{todo.title}</span>
						{justCompleted && <span className="text-yellow-500">✨</span>}
						<div>
							<Button variant="ghost" size="sm" onClick={handleEdit} className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent">
								<Edit className="h-3 w-3" />
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* 删除按钮 */}
			<div>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onDelete?.(todo.id)}
					className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200 dark:hover:bg-red-900/50"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}
