import { Card, CardContent } from '@/components/ui/card'

/**
 * OSS上传进度组件
 * 显示文件上传的进度条
 */
export const TestOssUploadProgress = (props: TestOssUploadProgressProps) => {
	const { uploading, progress } = props
	if (!uploading) return null

	return (
		<Card data-slot="test-oss-upload-progress">
			<CardContent className="pt-6">
				<div className="flex items-center gap-2">
					<div>上传中...</div>
					<div className="flex-1 bg-gray-200 rounded-full h-2">
						<div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
					</div>
					<div>{progress}%</div>
				</div>
			</CardContent>
		</Card>
	)
}

export interface TestOssUploadProgressProps {
	uploading: boolean
	progress: number
}
