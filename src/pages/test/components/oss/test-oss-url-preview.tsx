import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * OSS URL预览组件
 * 输入OSS路径并获取签名URL进行预览
 */
export const TestOssUrlPreview = (props: TestOssUrlPreviewProps) => {
	const { path, preview, onPathChange, onGetSignedUrl } = props
	return (
		<Card>
			<CardHeader>
				<CardTitle>OSS签名URL获取</CardTitle>
				<CardDescription>输入OSS路径，获取STS签名的临时访问链接</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="oss-path">OSS路径</Label>
						<div className="flex gap-2">
							<Input
								id="oss-path"
								placeholder="例如: images/1234567890_abc123.jpg"
								value={path}
								onChange={(e) => onPathChange?.(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') onGetSignedUrl?.()
								}}
							/>
							<Button onClick={onGetSignedUrl}>获取URL</Button>
						</div>
						<div className="text-xs text-gray-500">输入OSS路径后点击获取URL按钮将生成带STS签名的临时访问链接</div>
					</div>

					{preview && (
						<div className="space-y-4">
							<div className="space-y-2">
								<div className="text-sm font-medium">Url 结果:</div>
								<div className="text-xs text-gray-600 overflow-hidden">
									<a href={preview} target="_blank" rel="noopener noreferrer">
										{preview}
									</a>
								</div>
							</div>

							<div className="border rounded p-2">
								<img
									src={preview}
									alt="OSS签名URL图片"
									className="max-w-full max-h-64 object-contain"
									onError={(e) => {
										e.currentTarget.style.display = 'none'
										const next = e.currentTarget.nextElementSibling as HTMLElement
										if (next) {
											next.textContent = '图片加载失败或路径不存在'
											next.classList.remove('hidden')
										}
									}}
								/>
								<div className="text-red-500 text-sm hidden">图片加载失败或路径不存在</div>
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

export type TestOssUrlPreviewProps = {
	path: string
	preview: string
	onPathChange?: (path: string) => void
	onGetSignedUrl?: () => void
}
