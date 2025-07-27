import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImagePreview } from '@/components/common/image-preview'

/**
 * 测试图片预览智能尺寸适配
 */
const TestImgPrevSmart = () => {
	const [selectedImage, setSelectedImage] = useState('')

	// 测试用的不同尺寸图片
	const testImages = [
		{
			name: '低分辨率正方形 (100x100)',
			url: 'https://picsum.photos/100/100',
			description: '小尺寸图片，不应该被拉伸变糊',
		},
		{
			name: '中等分辨率横向 (400x300)',
			url: 'https://picsum.photos/400/300',
			description: '中等尺寸横向图片',
		},
		{
			name: '中等分辨率纵向 (300x400)',
			url: 'https://picsum.photos/300/400',
			description: '中等尺寸纵向图片',
		},
		{
			name: '高分辨率横向 (1920x1080)',
			url: 'https://picsum.photos/1920/1080',
			description: '高分辨率图片，应该缩放到屏幕大小',
		},
		{
			name: '超宽图片 (800x200)',
			url: 'https://picsum.photos/800/200',
			description: '超宽比例图片',
		},
		{
			name: '超高图片 (200x800)',
			url: 'https://picsum.photos/200/800',
			description: '超高比例图片',
		},
		{
			name: '极小图片 (50x50)',
			url: 'https://picsum.photos/50/50',
			description: '极小图片，应该保持原始尺寸不放大',
		},
		{
			name: '超大图片 (4000x3000)',
			url: 'https://picsum.photos/4000/3000',
			description: '超大图片，应该智能缩放',
		},
	]

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>图片预览智能尺寸适配测试</CardTitle>
					<CardDescription>
						测试不同尺寸图片的预览效果。改进后的组件应该：
						<br />• 小图片保持原始尺寸，不会被拉伸变糊
						<br />• 大图片智能缩放到屏幕大小
						<br />• 保持图片原始宽高比
						<br />• 适配不同的屏幕尺寸
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{testImages.map((img, idx) => (
							<div key={idx} className="space-y-2">
								<p className="text-sm font-medium">{img.name}</p>
								<p className="text-xs text-gray-500">{img.description}</p>
								<ImagePreview url={img.url} noEditable size={120} className="border" />
								<Button variant="outline" size="sm" onClick={() => setSelectedImage(img.url)} className="w-full">
									设为当前测试图片
								</Button>
							</div>
						))}
					</div>

					{selectedImage && (
						<div className="mt-6 p-4 border rounded-lg bg-gray-50">
							<h3 className="text-lg font-semibold mb-2">当前测试图片</h3>
							<p className="text-sm text-gray-600 mb-4">
								点击下面的图片查看预览效果。注意观察：
								<br />• 预览窗口是否根据图片尺寸智能调整
								<br />• 图片是否保持清晰度（特别是小图片）
								<br />• 是否保持原始宽高比
							</p>
							<div className="flex justify-center">
								<ImagePreview url={selectedImage} noEditable size={200} className="border-2 border-blue-500" />
							</div>
							<div className="mt-4 text-center">
								<Button variant="outline" onClick={() => setSelectedImage('')}>
									清除测试图片
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

export default TestImgPrevSmart;
