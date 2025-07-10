import React, { useState, useRef } from 'react'
import { Play, Plus, Trash2, Video as VideoIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useMemoizedFn } from 'ahooks'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

/**
 * 视频预览组件
 */
export const VideoPreview = (props: VideoPreviewProps) => {
	const { url, defaultUrl, cover, notEditable = false, onUpload, onDelete, onChange, className, style, children, width, height, size } = props
	const editable = !notEditable
	const [internalUrl, setInternalUrl] = useState(defaultUrl || '')
	const curUrl = url ?? internalUrl // 如果外部没有传入url，则使用内部url

	// 计算实际的宽高
	const actualWidth = width || size || '100%'
	const actualHeight = height || size || 'unset'
	const aspectRatio = actualHeight === 'unset' ? '16/9' : 'unset'
	const [isPreviewOpen, setIsPreviewOpen] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileUpload = useMemoizedFn((event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			// 创建本地预览 URL
			const fileUrl = URL.createObjectURL(file)

			// 如果没有外部url控制，更新内部状态
			if (url === undefined) {
				setInternalUrl(fileUrl)
			}

			onChange?.(fileUrl)
			onUpload?.(file)
		}
	})

	const handleUploadClick = () => {
		fileInputRef.current?.click()
	}

	const handleDelete = (e: React.MouseEvent) => {
		// 防止触发 hover
		e.stopPropagation()

		// 如果没有外部url控制，更新内部状态
		if (url === undefined) {
			setInternalUrl('')
		}

		onChange?.('')
		onDelete?.()
	}

	// 如果没有URL，显示空状态或上传按钮
	if (!curUrl) {
		return (
			<>
				<Card
					className={cn('flex items-center justify-center', editable && 'border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors', className)}
					style={{ width: actualWidth, height: actualHeight, aspectRatio, ...style }}
					onClick={editable ? handleUploadClick : undefined}
				>
					{editable ? <Plus className="w-8 h-8 text-gray-400" /> : <VideoIcon className="w-8 h-8 text-gray-400" />}
				</Card>
				{editable && <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />}
			</>
		)
	}

	return (
		<>
			<Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
				<DialogTrigger asChild>
					<div className={cn('relative cursor-pointer overflow-hidden', className)} style={{ width: actualWidth, height: actualHeight, aspectRatio, ...style }}>
						{children || (
							<>
								{/* 封面 */}
								{cover ? (
									<img src={cover} alt="视频封面" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
								) : (
									<video src={curUrl} className="absolute inset-0 w-full h-full object-cover rounded-lg" muted playsInline preload="metadata" />
								)}
							</>
						)}

						{/* 播放按钮蒙层 - 始终显示 */}
						<div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
							<Play className="w-8 h-8 text-white" />
						</div>

						{/* 删除按钮 */}
						{editable && <Trash2 className="absolute top-1 right-1 w-6 h-6 text-white hover:text-red-400 p-1 cursor-pointer transition-colors" onClick={handleDelete} />}
					</div>
				</DialogTrigger>

				<DialogContent showCloseButton={false} className="p-0 border-none bg-transparent" style={{ maxWidth: '1200px', width: '90vw' }}>
					{/* radix 对话框要求无障碍 */}
					<VisuallyHidden>
						<DialogTitle>预览视频</DialogTitle>
					</VisuallyHidden>
					<video src={curUrl} className="w-full h-full object-contain rounded-lg" controls autoPlay playsInline style={{ maxHeight: '80vh' }} />
				</DialogContent>
			</Dialog>

			{/* 隐藏的文件输入 */}
			{editable && <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />}
		</>
	)
}

export type VideoPreviewProps = {
	url?: string // 外部控制的视频URL，优先级高于内部状态
	defaultUrl?: string // 默认视频URL，仅在组件初始化时生效
	cover?: string // 自定义封面图片URL
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
}
