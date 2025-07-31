import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { CreatableCombobox, ComboboxOption } from '@/components/ui/creatable-combobox'
import { FormItem, FormLabel } from '@/components/common/form'
import { toast } from 'sonner'
import { Edit, Trash2, Plus, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CrudItem {
	id: string
	data: string
	category: string
	created_at: string
	updated_at: string
}

interface CreateEditForm {
	data: string
	category: string
}

export const Crud = () => {
	const [items, setItems] = useState<CrudItem[]>([])
	const [loading, setLoading] = useState(false)
	const [createDialogOpen, setCreateDialogOpen] = useState(false)
	const [editDialogOpen, setEditDialogOpen] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [currentItem, setCurrentItem] = useState<CrudItem | null>(null)
	const [selectedCategory, setSelectedCategory] = useState('general')
	const [createForm, setCreateForm] = useState<CreateEditForm>({
		data: '',
		category: 'general',
	})
	const [editForm, setEditForm] = useState<CreateEditForm>({
		data: '',
		category: 'general',
	})

	// 预设主题选项
	const [categoryOptions, setCategoryOptions] = useState<ComboboxOption[]>([
		{ value: 'general', label: 'general' },
		{ value: 'food', label: 'food' },
		{ value: 'travel', label: 'travel' },
		{ value: 'work', label: 'work' },
		{ value: 'hobby', label: 'hobby' },
	])

	// 添加新分类
	const handleAddCategory = (newCategory: string) => {
		const newOption = { value: newCategory.toLowerCase(), label: newCategory }
		setCategoryOptions((prev) => [...prev, newOption])
	}

	// 获取数据列表
	const fetchItems = async () => {
		setLoading(true)
		try {
			const response = await api.crud.getList({
				page: 1,
				limit: 100,
				category: selectedCategory,
			})
			if (response.data && Array.isArray(response.data.data)) {
				setItems(response.data.data)
			} else {
				setItems([])
			}
		} catch (error) {
			console.error('获取数据失败:', error)
			toast.error('获取数据失败')
			setItems([])
		} finally {
			setLoading(false)
		}
	}

	// 创建数据
	const handleCreate = async () => {
		if (!createForm.data.trim()) {
			toast.error('请输入数据内容')
			return
		}

		try {
			await api.crud.create({
				data: createForm.data,
				category: selectedCategory, // 使用当前选中的主题
			})
			toast.success('创建成功')
			setCreateDialogOpen(false)
			setCreateForm({ data: '', category: selectedCategory })
			fetchItems()
		} catch (error) {
			console.error('创建失败:', error)
			toast.error('创建失败')
		}
	}

	// 更新数据
	const handleUpdate = async () => {
		if (!currentItem || !editForm.data.trim()) {
			toast.error('请输入数据内容')
			return
		}

		try {
			await api.crud.update(currentItem.id.toString(), {
				data: editForm.data,
				category: editForm.category,
			})
			toast.success('更新成功')
			setEditDialogOpen(false)
			setCurrentItem(null)
			setEditForm({ data: '', category: selectedCategory })
			fetchItems()
		} catch (error) {
			console.error('更新失败:', error)
			toast.error('更新失败')
		}
	}

	// 删除数据
	const handleDelete = async () => {
		if (!currentItem) return

		try {
			await api.crud.delete(currentItem.id.toString())
			toast.success('删除成功')
			setDeleteDialogOpen(false)
			setCurrentItem(null)
			fetchItems()
		} catch (error) {
			console.error('删除失败:', error)
			toast.error('删除失败')
		}
	}

	// 打开编辑对话框
	const openEditDialog = (item: CrudItem) => {
		setCurrentItem(item)
		setEditForm({
			data: item.data,
			category: item.category,
		})
		setEditDialogOpen(true)
	}

	// 打开删除确认对话框
	const openDeleteDialog = (item: CrudItem) => {
		setCurrentItem(item)
		setDeleteDialogOpen(true)
	}

	// 格式化时间
	const formatTime = (timeStr: string) => {
		return new Date(timeStr).toLocaleString('zh-CN')
	}

	useEffect(() => {
		fetchItems()
	}, [selectedCategory])

	return (
		<div className="p-6 space-y-6" data-slot="crud">
			<div className="mb-6">
				<h1 className="text-2xl font-bold mb-2">通用型CRUD体验</h1>
				<p className="text-muted-foreground">这是一个通用的数据管理界面，支持数据的增删改查操作</p>
			</div>

			{/* 操作栏 */}
			<Card>
				<CardContent className="py-4">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-2">
								<Label className="text-sm font-medium whitespace-nowrap">主题分类</Label>
								<CreatableCombobox
									options={categoryOptions}
									value={selectedCategory}
									onValueChange={setSelectedCategory}
									onAddOption={handleAddCategory}
									placeholder="选择或添加主题分类"
									addButtonText={(input) => `添加 "${input}"`}
									className="w-48"
								/>
							</div>
							<div className="text-sm text-muted-foreground">共 {items.length} 条记录</div>
						</div>
						<div className="flex gap-2">
							<Button variant="outline" onClick={fetchItems} disabled={loading}>
								<RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
								刷新
							</Button>
							<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
								<DialogTrigger asChild>
									<Button>
										<Plus className="mr-2 h-4 w-4" />
										新建数据
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>新建数据</DialogTitle>
										<DialogDescription>创建一条新的数据记录</DialogDescription>
									</DialogHeader>
									<div className="space-y-4">
										<FormItem>
											<FormLabel htmlFor="create-category">分类</FormLabel>
											<div className="px-3 py-2 border rounded-md bg-muted text-sm">{selectedCategory}</div>
										</FormItem>
										<FormItem>
											<FormLabel htmlFor="create-data">数据内容</FormLabel>
											<Textarea id="create-data" value={createForm.data} onChange={(e) => setCreateForm((prev) => ({ ...prev, data: e.target.value }))} placeholder="输入数据内容" rows={4} />
										</FormItem>
									</div>
									<DialogFooter>
										<Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
											取消
										</Button>
										<Button onClick={handleCreate}>创建</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 数据表格 */}
			<Card>
				<CardContent className="p-0">
					{loading ? (
						<div className="p-6">
							<div className="text-center text-muted-foreground">加载中...</div>
						</div>
					) : items.length === 0 ? (
						<div className="p-6">
							<div className="text-center text-muted-foreground">暂无数据，点击新建数据创建第一条记录</div>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-16">ID</TableHead>
									<TableHead>内容</TableHead>
									<TableHead className="w-32">创建时间</TableHead>
									<TableHead className="w-32">更新时间</TableHead>
									<TableHead className="w-24">操作</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{items.map((item) => (
									<TableRow key={item.id}>
										<TableCell className="font-medium">{item.id}</TableCell>
										<TableCell>
											<div className="max-w-md">
												<div className="truncate text-sm">{item.data}</div>
												{item.data.length > 50 && <div className="text-xs text-muted-foreground mt-1">...</div>}
											</div>
										</TableCell>
										<TableCell className="text-xs">{formatTime(item.created_at)}</TableCell>
										<TableCell className="text-xs">{formatTime(item.updated_at)}</TableCell>
										<TableCell>
											<div className="flex gap-1">
												<Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
													<Edit className="h-4 w-4" />
												</Button>
												<Button variant="ghost" size="icon" onClick={() => openDeleteDialog(item)}>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* 编辑对话框 */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>编辑数据</DialogTitle>
						<DialogDescription>编辑数据记录 ID: {currentItem?.id}</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<FormItem>
							<FormLabel htmlFor="edit-category">分类</FormLabel>
							<CreatableCombobox
								options={categoryOptions}
								value={editForm.category}
								onValueChange={(value) => setEditForm((prev) => ({ ...prev, category: value }))}
								onAddOption={handleAddCategory}
								placeholder="选择或添加分类"
								addButtonText={(input) => `添加 "${input}"`}
							/>
						</FormItem>
						<FormItem>
							<FormLabel htmlFor="edit-data">数据内容</FormLabel>
							<Textarea id="edit-data" value={editForm.data} onChange={(e) => setEditForm((prev) => ({ ...prev, data: e.target.value }))} placeholder="输入数据内容" rows={4} />
						</FormItem>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditDialogOpen(false)}>
							取消
						</Button>
						<Button onClick={handleUpdate}>更新</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* 删除确认对话框 */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>确认删除</DialogTitle>
						<DialogDescription>确定要删除数据记录 ID: {currentItem?.id} 吗？此操作不可逆。</DialogDescription>
					</DialogHeader>
					<div className="my-4 p-4 bg-muted rounded-lg">
						<div className="text-sm font-medium mb-2">数据内容预览:</div>
						<div className="text-sm whitespace-pre-wrap">
							{currentItem?.data?.slice(0, 100)}
							{(currentItem?.data?.length || 0) > 100 && '...'}
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
							取消
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							删除
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
