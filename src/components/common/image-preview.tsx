import { useState, useRef, CSSProperties, useEffect, PropsWithChildren } from 'react'
import { Eye, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useMemoizedFn, useUnmount } from 'ahooks'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Loading } from './loading'

/**
 * 图片预览组件
 */
export const ImagePreview = (props: PropsWithChildren<ImagePreviewProps>) => {
	const {
		url,
		defaultUrl,
		loading,
		noEditable = false,
		noPreview = false,
		noHover = false,
		noInteraction = false,
		onUpload,
		onDelete,
		onChange,
		onCustomUpload,
		onCustomDelete,
		onCustomUploadError,
		onLoadingChange,
		className,
		style,
		children,
		width,
		height,
		size,
		aspectRatio,
		base64Mode = false,
	} = props
	const [intUrl, setInternalUrl] = useState(defaultUrl || '')
	const [internalLoading, setInternalLoading] = useState(false)

	// 当前实际的loading状态：外部传入优先，否则使用内部状态
	const currentLoading = loading !== undefined ? loading : internalLoading

	const objUrlRef = useRef('') // object url
	const curUrl = url ?? intUrl

	const w = width || size || '100%'
	const h = height || size
	const ar = aspectRatio || (h ? 'unset' : '1/1')
	const [open, setOpen] = useState(false)
	const [hover, setHover] = useState(false)
	const [imgDimension, setImgDimension] = useState<{ width: number; height: number } | null>(null)
	const fileRef = useRef<HTMLInputElement>(null)

	const revokeObjUrl = () => {
		if (objUrlRef.current) {
			URL.revokeObjectURL(objUrlRef.current)
			objUrlRef.current = ''
		}
	}

	const loadImgDimension = useMemoizedFn((imgUrl: string) => {
		if (!imgUrl) {
			setImgDimension(null)
			return
		}
		const img = new window.Image()
		img.onload = () => setImgDimension({ width: img.naturalWidth, height: img.naturalHeight })
		img.onerror = () => setImgDimension(null)
		img.src = imgUrl
	})

	useEffect(() => {
		loadImgDimension(curUrl)
	}, [curUrl, loadImgDimension])

	// 计算图片预览弹窗的最大尺寸，保证图片不会超出视口且保持原始宽高比
	const getPreviewDimension = () => {
		if (!imgDimension) return { maxWidth: '90vw', maxHeight: '90vh', aspectRatio: 'auto' } // 没有图片信息时默认最大限制
		const { width: iw, height: ih } = imgDimension
		const iar = iw / ih // 图片宽高比
		const mw = window.innerWidth * 0.9 // 视口宽度的90%
		const mh = window.innerHeight * 0.9 // 视口高度的90%
		let dw = iw
		let dh = ih

		// 如果图片宽度超出最大宽度，按比例缩放
		if (dw > mw) {
			dw = mw
			dh = dw / iar
		}
		// 如果图片高度超出最大高度，再次按比例缩放
		if (dh > mh) {
			dh = mh
			dw = dh * iar
		}
		// 最终尺寸不能超过原始图片
		dw = Math.min(dw, iw)
		dh = Math.min(dh, ih)
		return { maxWidth: `${Math.round(dw)}px`, maxHeight: `${Math.round(dh)}px`, aspectRatio: `${iw}/${ih}` }
	}

	const handleFileUpload = useMemoizedFn(async (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0]
		if (!f) return

		revokeObjUrl()

		// 如果有自定义上传函数，使用异步上传
		if (onCustomUpload) {
			setInternalLoading(true)
			onLoadingChange?.(true)
			try {
				const uploadedUrl = await onCustomUpload(f)
				if (uploadedUrl) {
					if (url === undefined) setInternalUrl(uploadedUrl)
					onChange?.(uploadedUrl)
					onUpload?.(f, uploadedUrl)
				} else {
					// 没有返回URL，触发错误回调
					onCustomUploadError?.(new Error('Upload failed: no URL returned'), f)
				}
			} catch (error) {
				onCustomUploadError?.(error as Error, f)
			} finally {
				setInternalLoading(false)
				onLoadingChange?.(false)
			}
		} else {
			// 原有逻辑：本地预览
			if (base64Mode) {
				const r = new FileReader()
				r.onload = (ev) => {
					const b64 = ev.target?.result as string
					if (url === undefined) setInternalUrl(b64)
					onChange?.(b64)
					onUpload?.(f, b64)
				}
				r.readAsDataURL(f)
			} else {
				const fUrl = URL.createObjectURL(f)
				objUrlRef.current = fUrl
				if (url === undefined) setInternalUrl(fUrl)
				onChange?.(fUrl)
				onUpload?.(f, fUrl)
			}
		}
	})

	const handleUploadClick = () => fileRef.current?.click()

	const handleDelete = useMemoizedFn((e: React.MouseEvent) => {
		e.stopPropagation()

		// 立即执行UI删除逻辑
		revokeObjUrl()
		if (url === undefined) setInternalUrl('')
		onChange?.('')
		onDelete?.()

		// 如果有自定义删除函数，后台静默执行（不等待）
		if (onCustomDelete) {
			onCustomDelete().catch((error) => {
				console.error('[ImagePreview] Custom delete failed:', error)
				// 静默处理错误，不影响UI
			})
		}
	})

	useUnmount(() => {
		// 手动上传的图片是 blob url 方便预览
		revokeObjUrl()
	})

	const cardStyle: CSSProperties = {
		width: w,
		height: h,
		aspectRatio: ar,
		...style,
	}

	const canHover = !noHover && !noPreview && !noInteraction && !currentLoading // preview不允许，也没有hover
	const canPreview = !noPreview && !noInteraction && !currentLoading
	const editable = !noEditable && !noInteraction && !currentLoading

	const handleOpenChange = (open: boolean) => {
		if (!canPreview) return
		setOpen(open)
	}

	const isCustom = !!children

	// 如果没有URL，并且非自定义，显示空状态或上传按钮
	if (!curUrl && !isCustom) {
		return (
			<>
				<Card
					className={cn('flex items-center justify-center', editable && 'border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors', className)}
					style={cardStyle}
					onClick={editable ? handleUploadClick : undefined}
				>
					{editable ? <Plus className="w-8 h-8 text-gray-400" /> : <ImageIcon className="w-8 h-8 text-gray-400" />}
				</Card>
				{editable && <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />}
			</>
		)
	}

	return (
		<>
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogTrigger asChild>
					{/* custom仅实现点击 preview，其他hover loading自行处理 */}
					{isCustom ? (
						<div className={className} style={cardStyle}>
							{children}
						</div>
					) : (
						<div
							className={cn('relative overflow-hidden rounded-lg', canHover && 'cursor-pointer', className)}
							style={cardStyle}
							onMouseEnter={canHover ? () => setHover(true) : undefined}
							onMouseLeave={canHover ? () => setHover(false) : undefined}
						>
							{/* 图片 */}
							<div className="absolute inset-0">
								<img src={curUrl} alt="预览图片" className="w-full h-full object-cover" />
							</div>

							{/* 预览眼睛 */}
							{canHover && (
								<div className={cn('absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity', hover ? 'opacity-100' : 'opacity-0')}>
									<Eye className="w-6 h-6 text-white" />
								</div>
							)}

							{/* Loading浮层 */}
							<Loading loading={currentLoading} className="text-white" />

							{/* 删除按钮 */}
							{editable && <Trash2 className="absolute top-1 right-1 w-6 h-6 text-white hover:text-red-400 p-1 cursor-pointer transition-colors" onClick={handleDelete} />}
						</div>
					)}
				</DialogTrigger>
				<DialogContent showCloseButton={false} className="p-0 border-none" style={getPreviewDimension()}>
					<VisuallyHidden>
						<DialogTitle>预览图片</DialogTitle>
					</VisuallyHidden>
					<img
						src={curUrl}
						alt="预览图片"
						className="w-full h-full object-contain"
						style={{
							maxWidth: '100%',
							maxHeight: '100%',
							width: 'auto',
							height: 'auto',
						}}
					/>
				</DialogContent>
			</Dialog>
			{editable && <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />}
		</>
	)
}

export interface ImagePreviewProps {
	url?: string // 外部控制的图片URL，优先级高于内部状态
	defaultUrl?: string // 默认图片URL，仅在组件初始化时生效
	loading?: boolean // 外部控制的loading状态，undefined时使用内部状态
	noEditable?: boolean // 是否不可编辑，既不允许上传和删除，默认false
	noHover?: boolean // 是否禁用悬停效果，默认false
	noPreview?: boolean // 注意 noHover 只是禁用 hover，但是不是禁用预览
	noInteraction?: boolean // 效果等于 noHover + noEditable
	onUpload?: (file: File, url?: string) => void // 文件上传完成回调，返回文件和URL（如有）
	onDelete?: () => void // 删除完成回调
	onChange?: (url: string | undefined) => void // URL变化回调，上传和删除时都会调用
	onCustomUpload?: (file: File) => Promise<string | undefined> // 自定义异步上传函数，返回URL
	onCustomDelete?: () => Promise<void> // 自定义异步删除函数
	onCustomUploadError?: (error: Error, file: File) => void // 自定义上传错误回调
	onLoadingChange?: (loading: boolean) => void // loading状态变化回调
	className?: string // 样式类名
	style?: CSSProperties // 内联样式
	width?: number // 宽度（像素）
	height?: number // 高度（像素）
	size?: number // 统一尺寸（像素）
	aspectRatio?: string // 宽高比，如 '16/9', '4/3', '1/1' 等
	base64Mode?: boolean // 是否使用base64模式
}
