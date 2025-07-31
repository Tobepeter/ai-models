import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Send } from 'lucide-react'
import { useState, useRef } from 'react'
import { feedMgr } from '../feed-mgr'
import { useFeedStore } from '../feed-store'
import { OssImagePreview } from '@/components/common/oss-image-preview'
import { OssUploadResult } from '@/utils/oss/oss-types'

// 表单验证schema - 文字和图片二选一必须有
const createFeedSchema = z.object({
	content: z.string().max(500, '内容不能超过500字').optional(),
	image: z.string().optional(),
}).refine(data => {
	const hasContent = data.content && data.content.trim().length > 0
	const hasImage = data.image && data.image.length > 0
	return hasContent || hasImage
}, {
	message: '请输入内容或上传图片',
	path: ['content'], // 错误显示在content字段上
})

type CreateFeedForm = z.infer<typeof createFeedSchema>

/* 新建Feed弹窗组件 */
export const FeedCreateDialog = () => {
	const { loading, createDialog, closeCreateDialog } = useFeedStore()
	const [imageUrl, setImageUrl] = useState<string>('')
	const currentObjectKeyRef = useRef<string>('') // 保存当前上传的OSS objectKey
	const hasSubmittedRef = useRef<boolean>(false) // 标记是否已经提交过

	const form = useForm<CreateFeedForm>({
		resolver: zodResolver(createFeedSchema),
		defaultValues: {
			content: '',
			image: '',
		},
	})

	const onSubmit = async (data: CreateFeedForm) => {
		try {
			hasSubmittedRef.current = true // 标记已提交，防止关闭时删除OSS文件
			await feedMgr.createFeed(data.content || '', data.image || '')
			form.reset()
			setImageUrl('')
			currentObjectKeyRef.current = '' // 清空 objectKey 引用
			hasSubmittedRef.current = false // 重置提交状态
			closeCreateDialog()
		} catch (error) {
			hasSubmittedRef.current = false // 提交失败时重置状态
			console.error('创建失败:', error)
		}
	}

	// OSS上传成功回调
	const handleOssUpload = (result: OssUploadResult, file: File) => {
		currentObjectKeyRef.current = result.objectKey
		setImageUrl(result.url)
		form.setValue('image', result.url)
		form.trigger('image') // 触发验证
	}

	// OSS删除回调
	const handleOssDelete = async (objectKey: string) => {
		// 这里不做实际删除，由OssImagePreview组件内部处理
		currentObjectKeyRef.current = ''
		setImageUrl('')
		form.setValue('image', '')
		form.trigger('image') // 触发验证
	}

	// 检查表单是否有效（文字或图片至少有一个）
	const isFormValid = () => {
		const content = form.watch('content')
		const image = form.watch('image')
		const hasContent = content && content.trim().length > 0
		const hasImage = image && image.length > 0
		return hasContent || hasImage
	}

	const handleClose = () => {
		// 如果正在loading(提交中)，阻止关闭
		if (loading) {
			return
		}
		
		// 如果正在提交或已经提交过，不要删除OSS文件
		// OssImagePreview内部会自动处理文件删除，但我们需要防止提交过程中的误删
		if (!hasSubmittedRef.current && currentObjectKeyRef.current) {
			// 只有在未提交状态下才可能需要清理OSS文件
			// 实际删除由OssImagePreview组件内部的cleanup逻辑处理
		}
		
		form.reset()
		setImageUrl('')
		currentObjectKeyRef.current = ''
		hasSubmittedRef.current = false // 重置提交状态
		closeCreateDialog()
	}

	return (
		<Dialog open={createDialog.isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>分享动态</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{/* 内容 */}
						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormLabel>内容</FormLabel>
									<FormControl>
										<Textarea placeholder="分享你的想法..." {...field} className="min-h-[100px] resize-none" maxLength={500} />
									</FormControl>
									<div className="flex justify-between items-center text-xs text-muted-foreground">
										<FormMessage />
										<span>{field.value?.length || 0}/500</span>
									</div>
								</FormItem>
							)}
						/>

						{/* 图片上传 */}
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium">图片</span>
							</div>
							<OssImagePreview
								url={imageUrl}
								onOssUpload={handleOssUpload}
								onOssDelete={handleOssDelete}
								width={200}
								height={150}
								className="border border-dashed border-gray-300 rounded-lg"
							/>
						</div>

						{/* 提交按钮 */}
						<div className="flex justify-end gap-2 pt-2">
							<Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
								取消
							</Button>
							<Button type="submit" disabled={loading || !isFormValid()}>
								<Send className="h-4 w-4 mr-2" />
								{loading ? '发布中...' : '发布'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
