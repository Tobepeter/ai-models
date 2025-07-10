import React, { useState, useRef, useEffect } from 'react'
import { Play, Plus, Trash2, Video as VideoIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useMemoizedFn } from 'ahooks'

/**
 * 视频预览组件
 */
export const VideoPreview = (props: VideoPreviewProps) => {
	const { url, notEditable = false, onUpload, onDelete, onChange, className, style, children, width, height, size = 128 } = props

	const editable = !notEditable

	// 内部维护的 URL 状态
	const [internalUrl, setInternalUrl] = useState<string | undefined>(undefined)

	// 使用 prop 传递的 url，如果不是 undefined 则使用 prop，否则使用内部状态
	const currentUrl = url !== undefined ? url : internalUrl

	// 计算实际的宽高
	const actualWidth = width || size
	const actualHeight = height || size
	const [isPreviewOpen, setIsPreviewOpen] = useState(false)
	const [poster, setPoster] = useState<string | undefined>(undefined)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const videoRef = useRef<HTMLVideoElement>(null)

	// 生成视频封面
	const generatePoster = useMemoizedFn((videoUrl: string) => {
		const video = document.createElement('video')
		video.src = videoUrl
		video.muted = true
		video.playsInline = true
		video.preload = 'metadata'

		video.onloadedmetadata = () => {
			// 设置时间点为视频时长的 10% 或 1 秒，取较小值
			const seekTime = Math.min(video.duration * 0.1, 1)
			video.currentTime = seekTime
		}

		video.onseeked = () => {
			try {
				const canvas = document.createElement('canvas')
				const ctx = canvas.getContext('2d')
				if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
					canvas.width = video.videoWidth
					canvas.height = video.videoHeight
					ctx.drawImage(video, 0, 0)
					const posterUrl = canvas.toDataURL('image/jpeg', 0.8)
					setPoster(posterUrl)
				}
			} catch (error) {
				console.warn('无法生成视频封面:', error)
			}
		}

		video.onerror = () => {
			console.warn('视频加载失败，无法生成封面')
		}
	})

	const handleFileUpload = useMemoizedFn((event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			// 创建本地预览 URL
			const fileUrl = URL.createObjectURL(file)

			// 维护内部状态
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

		// 维护内部状态
		if (url === undefined) {
			setInternalUrl(undefined)
		}

		// 清理封面
		setPoster(undefined)

		onChange?.('')
		onDelete?.()
	}

	const handlePreview = () => {
		if (currentUrl) {
			setIsPreviewOpen(true)
		}
	}

	const handleClosePreview = () => {
		setIsPreviewOpen(false)
	}

	// 监听 currentUrl 变化，生成封面
	useEffect(() => {
		if (currentUrl) {
			generatePoster(currentUrl)
		} else {
			setPoster(undefined)
		}
	}, [currentUrl, generatePoster])

	// 如果没有URL，显示空状态或上传按钮
	if (!currentUrl) {
		return (
			<>
				<Card
					className={cn('flex items-center justify-center', editable && 'border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors', className)}
					style={{ width: actualWidth, height: actualHeight, ...style }}
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
					<div className={cn('relative cursor-pointer overflow-hidden', className)} style={children ? style : { width: actualWidth, height: actualHeight, ...style }}>
						{children || (
							<>
								{/* 视频元素（隐藏），仅用于生成封面 */}
								<video ref={videoRef} src={currentUrl} className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-0" muted playsInline preload="metadata" />

								{/* 封面图片 */}
								{poster && <img src={poster} alt="视频封面" className="absolute inset-0 w-full h-full object-cover rounded-lg" />}

								{/* 如果没有封面，显示占位背景 */}
								{!poster && (
									<div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
										<VideoIcon className="w-12 h-12 text-gray-400" />
									</div>
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
					<video src={currentUrl} className="w-full h-full object-contain rounded-lg" controls autoPlay playsInline style={{ maxHeight: '80vh' }} />
				</DialogContent>
			</Dialog>

			{/* 隐藏的文件输入 */}
			{editable && <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />}
		</>
	)
}

export type VideoPreviewProps = {
	url?: string // 视频URL，如果不是undefined则使用此值，否则使用内部状态
	notEditable?: boolean // 是否不可编辑，默认false（即默认可编辑）
	onUpload?: (file: File) => void // 文件上传回调
	onDelete?: () => void // 删除回调
	onChange?: (url: string | undefined) => void // URL变化回调，上传和删除时都会调用
	className?: string // 样式类名
	style?: React.CSSProperties // 内联样式
	children?: React.ReactNode // 插槽内容
	width?: number // 宽度（像素）
	height?: number // 高度（像素）
	size?: number // 统一尺寸（像素），默认128，当没有指定width或height时使用
}
