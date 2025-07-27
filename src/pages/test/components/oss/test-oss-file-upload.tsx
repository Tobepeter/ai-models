import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OssUploadResult } from '@/utils/oss/oss-types'
import { RefObject } from 'react'

/**
 * OSS文件上传组件
 * 处理文件选择、上传和结果展示
 */
export const TestOssFileUpload = ({ uploading, result, fileRef, onUpload, onSelectFile, onDeleteResult }: TestOssFileUploadProps) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>文件上传测试</CardTitle>
				<CardDescription>选择文件上传到阿里云OSS，获取objectKey进行访问</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-4">
					<div className="flex gap-2">
						<Button onClick={onSelectFile} disabled={uploading}>
							{uploading ? '上传中...' : '选择文件'}
						</Button>
						{result && (
							<Button variant="outline" onClick={onDeleteResult}>
								删除文件
							</Button>
						)}
					</div>

					<input 
						ref={fileRef} 
						type="file" 
						accept="image/*" 
						className="hidden" 
						onChange={onUpload} 
					/>

					{result && (
						<div className="space-y-4">
							<div className="space-y-2">
								<div className="text-sm font-medium">上传结果:</div>
								<div className="text-xs text-gray-600 space-y-1">
									<div>
										<strong>ObjectKey:</strong> {result.objectKey}
									</div>
									<div className="text-xs text-gray-600 overflow-hidden">
										<a href={result.url} target="_blank" rel="noopener noreferrer">
											访问URL:{result.url}
										</a>
									</div>
									<div>
										<strong>文件大小:</strong> {(result.size / 1024).toFixed(2)} KB
									</div>
									<div>
										<strong>上传时间:</strong> {new Date(result.uploadTime).toLocaleString()}
									</div>
								</div>
							</div>

							<div className="border rounded p-2">
								<img
									src={result.url}
									alt="上传的图片"
									className="max-w-full max-h-64 object-contain"
									onError={(e) => {
										e.currentTarget.style.display = 'none'
										const next = e.currentTarget.nextElementSibling as HTMLElement
										if (next) {
											next.textContent = '图片加载失败'
											next.classList.remove('hidden')
										}
									}}
								/>
								<div className="text-red-500 text-sm hidden">图片加载失败</div>
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

export type TestOssFileUploadProps = {
	uploading: boolean
	result: OssUploadResult | null
	fileRef: RefObject<HTMLInputElement>
	onUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void
	onSelectFile?: () => void
	onDeleteResult?: () => void
}


