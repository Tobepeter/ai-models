import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImagePreview } from '@/components/common/image-preview'
import { Button } from '@/components/ui/button'
import { dummy } from '@/utils/dummy'

/**
 * ImagePreview AspectRatio 测试组件
 */
export const TestImagePreviewAspectRatio = () => {
	const [imageUrl, setImageUrl] = useState('')

	const aspectRatios = [
		{ label: '1:1 (正方形)', value: '1/1' },
		{ label: '16:9 (宽屏)', value: '16/9' },
		{ label: '4:3 (传统)', value: '4/3' },
		{ label: '3:4 (竖屏)', value: '3/4' },
		{ label: '21:9 (超宽)', value: '21/9' },
		{ label: '9:16 (手机竖屏)', value: '9/16' },
	]

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>ImagePreview AspectRatio 测试</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-2 flex-wrap">
						<Button variant="outline" onClick={() => setImageUrl('')}>
							清空图片
						</Button>
						<Button variant="outline" onClick={() => setImageUrl(dummy.image)}>
							加载测试图片
						</Button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{aspectRatios.map(({ label, value }) => (
							<div key={value} className="space-y-2">
								<h3 className="text-sm font-medium text-center">{label}</h3>
								<ImagePreview
									url={imageUrl}
									aspectRatio={value}
									width={200}
									onChange={setImageUrl}
									className="border"
								/>
							</div>
						))}
					</div>

					<div className="space-y-4">
						<h3 className="text-lg font-semibold">固定高度 vs AspectRatio 对比</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<h4 className="text-sm font-medium text-center">固定高度 (200px)</h4>
								<ImagePreview
									url={imageUrl}
									width={200}
									height={200}
									onChange={setImageUrl}
									className="border"
								/>
							</div>
							<div className="space-y-2">
								<h4 className="text-sm font-medium text-center">AspectRatio (1/1)</h4>
								<ImagePreview
									url={imageUrl}
									width={200}
									aspectRatio="1/1"
									onChange={setImageUrl}
									className="border"
								/>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="text-lg font-semibold">响应式宽度测试</h3>
						<div className="space-y-4">
							<div className="space-y-2">
								<h4 className="text-sm font-medium">100% 宽度 + 16:9 比例</h4>
								<ImagePreview
									url={imageUrl}
									aspectRatio="16/9"
									onChange={setImageUrl}
									className="border max-w-md"
								/>
							</div>
							<div className="space-y-2">
								<h4 className="text-sm font-medium">100% 宽度 + 4:3 比例</h4>
								<ImagePreview
									url={imageUrl}
									aspectRatio="4/3"
									onChange={setImageUrl}
									className="border max-w-md"
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
