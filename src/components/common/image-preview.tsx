import { useState, useRef, CSSProperties, useEffect } from 'react'
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
	const { url, defaultUrl, notEditable = false, onUpload, onDelete, onChange, className, style, children, width, height, size, aspectRatio, base64Mode = false, noInteraction = false } = props
	const editable = !notEditable && !noInteraction
	const [intUrl, setIntUrl] = useState(defaultUrl || '')
	const objUrlRef = useRef('') // object url
	const curUrl = url ?? intUrl

	const w = width || size || '100%'
	const h = height || size
	const ar = aspectRatio || (h ? 'unset' : '1/1')
	const [open, setOpen] = useState(false)
	const [hover, setHover] = useState(false)
	const [imgDim, setImgDim] = useState<{ width: number; height: number } | null>(null)
	const fileRef = useRef<HTMLInputElement>(null)

	const revokeObjUrl = () => {
		if (objUrlRef.current) {
			URL.revokeObjectURL(objUrlRef.current)
			objUrlRef.current = ''
		}
	}

	const loadImgDim = useMemoizedFn((imgUrl: string) => {
		if (!imgUrl) {
			setImgDim(null)
			return
		}
		const img = new window.Image()
		img.onload = () => setImgDim({ width: img.naturalWidth, height: img.naturalHeight })
		img.onerror = () => setImgDim(null)
		img.src = imgUrl
	})

	useEffect(() => {
		loadImgDim(curUrl)
	}, [curUrl, loadImgDim])

	// 计算图片预览弹窗的最大尺寸，保证图片不会超出视口且保持原始宽高比
	const getPreviewDim = () => {
		if (!imgDim) return { maxWidth: '90vw', maxHeight: '90vh', aspectRatio: 'auto' } // 没有图片信息时默认最大限制
		const { width: iw, height: ih } = imgDim
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

	const handleFileUpload = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0]
		if (f) {
			revokeObjUrl()
			onUpload?.(f)
			if (base64Mode) {
				const r = new FileReader()
				r.onload = (ev) => {
					const b64 = ev.target?.result as string
					if (url === undefined) setIntUrl(b64)
					onChange?.(b64)
				}
				r.readAsDataURL(f)
			} else {
				const fUrl = URL.createObjectURL(f)
				objUrlRef.current = fUrl
				if (url === undefined) setIntUrl(fUrl)
				onChange?.(fUrl)
			}
		}
	})

	const handleUploadClick = () => fileRef.current?.click()

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation()
		revokeObjUrl()
		if (url === undefined) setIntUrl('')
		onChange?.('')
		onDelete?.()
	}

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

	const isCustom = !!children

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
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					{isCustom ? (
						<div className={className} style={cardStyle}>
							{children}
						</div>
					) : (
						<div className={cn('relative cursor-pointer overflow-hidden rounded-lg', className)} style={cardStyle} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
							<div className="absolute inset-0">
								<img src={curUrl} alt="预览图片" className="w-full h-full object-cover" />
							</div>
							<div className={cn('absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity', hover ? 'opacity-100' : 'opacity-0')}>
								<Eye className="w-6 h-6 text-white" />
							</div>
							{editable && <Trash2 className="absolute top-1 right-1 w-6 h-6 text-white hover:text-red-400 p-1 cursor-pointer transition-colors" onClick={handleDelete} />}
						</div>
					)}
				</DialogTrigger>
				<DialogContent showCloseButton={false} className="p-0 border-none" style={getPreviewDim()}>
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

export type ImagePreviewProps = {
	url?: string // 外部控制的图片URL，优先级高于内部状态
	defaultUrl?: string // 默认图片URL，仅在组件初始化时生效
	notEditable?: boolean // 是否不可编辑，默认false（即默认可编辑）
	noInteraction?: boolean // 是否禁用所有交互功能（上传、删除、悬停效果），默认false
	onUpload?: (file: File) => void // 文件上传回调
	onDelete?: () => void // 删除回调
	onChange?: (url: string | undefined) => void // URL变化回调，上传和删除时都会调用
	className?: string // 样式类名
	style?: CSSProperties // 内联样式
	children?: React.ReactNode // 插槽内容，优先级高于默认图片渲染
	width?: number // 宽度（像素）
	height?: number // 高度（像素）
	size?: number // 统一尺寸（像素）
	aspectRatio?: string // 宽高比，如 '16/9', '4/3', '1/1' 等
	base64Mode?: boolean // 是否使用base64模式
}
