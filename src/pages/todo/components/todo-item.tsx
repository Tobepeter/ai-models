import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTodoStore } from '@/pages/todo/todo-store'
import type { TodoResponse } from '@/api/types/generated'

export interface TodoItemProps {
	todo: TodoResponse
	onEdit?: (id: number, title: string) => void
	onDelete?: (id: number) => void
}

/** 简单的todo项组件 */
export const TodoItem = (props: TodoItemProps) => {
	const { todo, onEdit, onDelete } = props
	const { toggleTodo } = useTodoStore()
	const [isEditing, setIsEditing] = useState(false)
	const [editTitle, setEditTitle] = useState(todo.title || '')

	const handleEdit = () => {
		setIsEditing(true)
	}

	const handleSave = () => {
		if (editTitle.trim() && onEdit && todo.id) {
			onEdit(todo.id, editTitle.trim())
		}
		setIsEditing(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSave()
		} else if (e.key === 'Escape') {
			setEditTitle(todo.title || '')
			setIsEditing(false)
		}
	}

	const handleToggle = () => {
		if (todo.id) {
			toggleTodo(todo.id)
		}
	}

	return (
		<div className="flex items-center gap-3">
			{/* 完成按钮 */}
			<div className="flex items-center h-5">
				<Checkbox checked={todo.completed} onCheckedChange={handleToggle} />
			</div>

			{/* 标题 */}
			<div className="flex-1">
				{isEditing ? (
				<Input 
					value={editTitle} 
					onChange={(e) => setEditTitle(e.target.value)} 
					onBlur={handleSave} 
					onKeyDown={handleKeyDown} 
					className="h-8 text-sm" 
					autoFocus 
					maxLength={50}
				/>
			) : (
				<div className="flex items-center gap-2">
					<span className={cn('text-sm', todo.completed && 'line-through text-muted-foreground')}>{todo.title}</span>
					<div>
						<Button variant="ghost" size="sm" onClick={handleEdit} className="h-6 w-6 p-0">
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
					onClick={() => onDelete?.(todo.id!)}
					className="h-8 w-8 p-0"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}
