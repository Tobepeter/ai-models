import { useState, useRef, PropsWithChildren } from 'react'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/common/loading'
import { ossClient } from '@/utils/oss/oss-client'
import { OssUploadResult } from '@/utils/oss/oss-types'

export interface FileUploadProps {
  /**
   * 是否启用OSS上传
   */
  ossEnable?: boolean
  /**
   * 默认按钮显示的文本
   */
  text?: string
  /**
   * 上传成功回调
   * @param file 上传的文件
   * @param result OSS上传结果（仅在ossEnable为true时提供）
   */
  onUpload?: (file: File, result?: OssUploadResult) => void
  /**
   * 加载状态变化回调
   */
  onLoadingChange?: (loading: boolean) => void
}

/**
 * 文件上传组件
 * 
 * 支持OSS上传，可自定义渲染内容
 */
export const FileUpload = (props: PropsWithChildren<FileUploadProps>) => {
  const { ossEnable = false, text = '上传', onUpload, onLoadingChange, children } = props
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    onLoadingChange?.(true)
    try {
      if (ossEnable) {
        // 使用OSS上传
        const result: OssUploadResult = await ossClient.uploadFile(file)
        onUpload?.(file, result)
      } else {
        // 普通上传（仅返回文件对象）
        onUpload?.(file)
      }
    } catch (error) {
      console.error('文件上传失败:', error)
    } finally {
      setUploading(false)
      onLoadingChange?.(false)
    }
  }

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
    // 重置input值，确保可以重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="relative inline-block">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />
      
      {children ? (
        <div onClick={handleClick} className={uploading ? 'pointer-events-none' : ''}>
          {children}
          <Loading loading={uploading} noOverlay />
        </div>
      ) : (
        <Button onClick={handleClick} disabled={uploading}>
          {text}
          <Loading loading={uploading} noOverlay className="ml-2" />
        </Button>
      )}
    </div>
  )
}
