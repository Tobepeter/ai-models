import React, { useState, useRef, CSSProperties } from 'react'
import { Eye, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useMemoizedFn, useUnmount } from 'ahooks'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

/**
 * 图片预览组件
 */
export const ImagePreview = (props: ImagePreviewProps) => {
	const { url, defaultUrl, notEditable = false, onUpload, onDelete, onChange, className, style, children, width, height, size, aspectRatio, base64Mode = false } = props
	const editable = !notEditable
	const [internalUrl, setInternalUrl] = useState(defaultUrl || '')
	const objectUrlRef = useRef('') // 用ref跟踪object url
	const curUrl = url ?? internalUrl // 如果外部没有传入url，则使用内部url

	// 计算实际的宽高和宽高比
	const actualWidth = width || size || '100%'
	const actualHeight = height || size
	const computedAspectRatio = aspectRatio || (actualHeight ? 'unset' : '1/1')
	const [isPreviewOpen, setIsPreviewOpen] = useState(false)
	const [isHovering, setIsHovering] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// 清理 object url
	const revokeObjectUrl = () => {
		if (objectUrlRef.current) {
			URL.revokeObjectURL(objectUrlRef.current)
			objectUrlRef.current = ''
		}
	}

	const handleFileUpload = useMemoizedFn((event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			revokeObjectUrl()
			onUpload?.(file)

			if (base64Mode) {
				// base64模式：将文件转换为base64
				const reader = new FileReader()
				reader.onload = (e) => {
					const base64Url = e.target?.result as string
					if (url === undefined) setInternalUrl(base64Url)
					onChange?.(base64Url)
				}
				reader.readAsDataURL(file)
			} else {
				// 普通模式：使用object URL
				const fileUrl = URL.createObjectURL(file)
				objectUrlRef.current = fileUrl
				if (url === undefined) setInternalUrl(fileUrl)
				onChange?.(fileUrl)
			}
		}
	})

	const handleUploadClick = () => {
		fileInputRef.current?.click()
	}

	const handleDelete = (e: React.MouseEvent) => {
		// 防止触发 hover
		e.stopPropagation()
		revokeObjectUrl()

		if (url === undefined) setInternalUrl('')

		onChange?.('')
		onDelete?.()
	}

	// 组件卸载时清理 object url（base64模式下不需要清理）
	useUnmount(() => {
		revokeObjectUrl()
	})

	const cardStyle: CSSProperties = {
		width: actualWidth,
		height: actualHeight,
		aspectRatio: computedAspectRatio,
		...style,
	}

	// 如果没有URL，显示空状态或上传按钮
	if (!curUrl) {
		return (
			<>
				<Card
					className={cn('flex items-center justify-center', editable && 'border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors', className)}
					style={cardStyle}
					onClick={editable ? handleUploadClick : undefined}
				>
					{editable ? <Plus className="w-8 h-8 text-gray-400" /> : <ImageIcon className="w-8 h-8 text-gray-400" />}
				</Card>
				{editable && <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />}
			</>
		)
	}

	return (
		<>
			<Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
				<DialogTrigger asChild>
					<div className={cn('relative cursor-pointer overflow-hidden rounded-lg', className)} style={cardStyle} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
						<div className="absolute inset-0">{children || <img src={curUrl} alt="预览图片" className="w-full h-full object-cover" />}</div>

						{/* 悬停时显示蒙层 */}
						<div className={cn('absolute inset-0 bg-black/40 flex items-center justify-center  transition-opacity', isHovering ? 'opacity-100' : 'opacity-0')}>
							<Eye className="w-6 h-6 text-white" />
						</div>

						{/* 删除按钮 */}
						{editable && <Trash2 className="absolute top-1 right-1 w-6 h-6 text-white hover:text-red-400 p-1 cursor-pointer transition-colors" onClick={handleDelete} />}
					</div>
				</DialogTrigger>

				<DialogContent showCloseButton={false} className="p-0 border-none aspect-square" style={{ maxWidth: '1000px', width: '80vw' }}>
					{/* radix 对话框要求无障碍 */}
					<VisuallyHidden>
						<DialogTitle>预览图片</DialogTitle>
					</VisuallyHidden>
					<img src={curUrl} alt="预览图片" className="w-full h-full object-contain" />
				</DialogContent>
			</Dialog>

			{/* 隐藏的文件输入 */}
			{editable && <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />}
		</>
	)
}

export type ImagePreviewProps = {
	url?: string // 外部控制的图片URL，优先级高于内部状态
	defaultUrl?: string // 默认图片URL，仅在组件初始化时生效
	notEditable?: boolean // 是否不可编辑，默认false（即默认可编辑）
	onUpload?: (file: File) => void // 文件上传回调
	onDelete?: () => void // 删除回调
	onChange?: (url: string | undefined) => void // URL变化回调，上传和删除时都会调用
	className?: string // 样式类名
	style?: React.CSSProperties // 内联样式
	children?: React.ReactNode // 插槽内容
	width?: number // 宽度（像素）
	height?: number // 高度（像素）
	size?: number // 统一尺寸（像素）
	aspectRatio?: string // 宽高比，如 '16/9', '4/3', '1/1' 等
	base64Mode?: boolean // 是否使用base64模式
}
