import { useRef } from 'react'
import { ImagePreview, ImagePreviewProps } from './image-preview'
import { ossClient } from '@/utils/oss/oss-client'
import { notify } from './notify'
import { useMemoizedFn } from 'ahooks'
import { OssUploadResult } from '@/utils/oss/oss-types'

/**
 * OSS 图片预览组件
 */
export const OssImagePreview = (props: OssImagePreviewProps) => {
	const { onOssUpload, onOssDelete, ...imagePreviewProps } = props
	const currentObjectKeyRef = useRef<string>('') // 维护当前的 objectKey

	const handleCustomUpload = useMemoizedFn(async (file: File): Promise<string | undefined> => {
		// 如果有旧的 objectKey，静默删除旧文件（不等待）
		if (currentObjectKeyRef.current) {
			ossClient.deleteFile(currentObjectKeyRef.current).catch((error) => {
				console.warn('[OssImagePreview] Failed to delete old file:', error)
			})
		}

		// 上传新文件
		const result = await ossClient.uploadFile(file)
		currentObjectKeyRef.current = result.objectKey // 保存新的 objectKey
		onOssUpload?.(result, file)
		return result.url
	})

	const handleCustomDelete = useMemoizedFn((): Promise<void> => {
		const objectKey = currentObjectKeyRef.current

		// 立即清空 objectKey 引用
		currentObjectKeyRef.current = ''

		// 如果有 objectKey 且有删除回调，执行删除
		if (objectKey && onOssDelete) {
			return onOssDelete(objectKey)
		}
		return Promise.resolve()
	})

	const handleCustomUploadError = useMemoizedFn((error: Error) => {
		console.error('[OssImagePreview] Upload failed:', error)
		notify.error(`上传失败: ${error.message}`)
	})

	const handleUpload = useMemoizedFn((file: File, url?: string) => {
		// 上传完成后的最终回调，可以用于其他逻辑
	})

	const handleDelete = useMemoizedFn(() => {
		// 删除完成后的最终回调，可以用于其他逻辑
	})

	return (
		<ImagePreview
			{...imagePreviewProps}
			onCustomUpload={handleCustomUpload}
			onCustomDelete={onOssDelete ? handleCustomDelete : undefined}
			onCustomUploadError={handleCustomUploadError}
			onUpload={handleUpload}
			onDelete={handleDelete} data-slot="oss-image-preview"
		/>
	)
}

export interface OssImagePreviewProps extends Omit<ImagePreviewProps, 'onCustomUpload' | 'onCustomDelete' | 'onCustomUploadError'> {
	/** OSS 上传成功回调 */
	onOssUpload?: (result: OssUploadResult, file: File) => void
	/** OSS 删除回调，传入 objectKey，需要返回Promise */
	onOssDelete?: (objectKey: string) => Promise<void>
}
