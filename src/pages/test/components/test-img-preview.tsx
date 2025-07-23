import { ImagePreview } from '@/components/common/image-preview'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dummy } from '@/utils/dummy'
import { useState } from 'react'

/**
 * 测试图片预览组件
 */
export const TestImgPreview = () => {
	const [uploadedUrl, setUploadedUrl] = useState<string>('')
	const [controllableUrl, setControllableUrl] = useState<string>(dummy.images.avatar)

	const handleUpload = (file: File) => {
		console.log('文件上传:', file)
	}

	const handleDelete = () => {
		console.log('删除图片')
	}

	const handleChange = (url: string | undefined) => {
		console.log('URL变化:', url)
		setUploadedUrl(url || '')
	}

	const handleControllableChange = (url: string | undefined) => {
		console.log('可控URL变化:', url)
		// 外部控制的场景不需要设置状态，由外部按钮控制
	}

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-bold">图片预览组件测试</h1>

			{/* 基础测试 */}
			<Card>
				<CardHeader>
					<CardTitle>基础功能</CardTitle>
					<CardDescription>测试基本的图片预览功能</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="space-y-2">
							<p className="text-sm text-gray-600">无URL，可编辑</p>
							<ImagePreview onUpload={handleUpload} onDelete={handleDelete} onChange={handleChange} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">无URL，不可编辑</p>
							<ImagePreview notEditable />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">有defaultUrl，可编辑</p>
							<ImagePreview defaultUrl={dummy.images.landscape} onUpload={handleUpload} onDelete={handleDelete} onChange={handleChange} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">有defaultUrl，不可编辑</p>
							<ImagePreview defaultUrl={dummy.images.portrait} notEditable />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 尺寸测试 */}
			<Card>
				<CardHeader>
					<CardTitle>尺寸测试</CardTitle>
					<CardDescription>测试不同尺寸的图片预览</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-end gap-4">
						<div className="space-y-2">
							<p className="text-sm text-gray-600">默认尺寸 (128px)</p>
							<ImagePreview defaultUrl={dummy.images.square} notEditable />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">小尺寸 (80px)</p>
							<ImagePreview defaultUrl={dummy.images.dummyRed} notEditable size={80} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">大尺寸 (200px)</p>
							<ImagePreview defaultUrl={dummy.images.dummyBlue} notEditable size={200} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">自定义宽高</p>
							<ImagePreview defaultUrl={dummy.images.dummyGreen} notEditable width={160} height={120} />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 头像测试 */}
			<Card>
				<CardHeader>
					<CardTitle>头像场景</CardTitle>
					<CardDescription>测试头像相关的使用场景</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-4">
						<div className="space-y-2">
							<p className="text-sm text-gray-600">男性头像</p>
							<ImagePreview defaultUrl={dummy.images.avatarMale} notEditable size={64} className="rounded-full overflow-hidden" />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">女性头像</p>
							<ImagePreview defaultUrl={dummy.images.avatarFemale} notEditable size={64} className="rounded-full overflow-hidden" />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">可编辑头像</p>
							<ImagePreview defaultUrl={dummy.images.avatar} size={64} className="rounded-full overflow-hidden" onUpload={handleUpload} onDelete={handleDelete} onChange={handleChange} />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 状态控制测试 */}
			<Card>
				<CardHeader>
					<CardTitle>状态控制测试</CardTitle>
					<CardDescription>测试URL状态的控制</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="space-y-2">
							<p className="text-sm text-gray-600">内部状态管理（无URL属性）</p>
							<p className="text-xs text-gray-500">当前URL: {uploadedUrl || '无'}</p>
							<ImagePreview onUpload={handleUpload} onDelete={handleDelete} onChange={handleChange} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">外部状态控制（有URL属性）</p>
							<p className="text-xs text-gray-500">当前URL: {controllableUrl || '无'}</p>
							<div className="flex items-center gap-2">
								<ImagePreview url={controllableUrl} onUpload={handleUpload} onDelete={handleDelete} onChange={handleControllableChange} />
								<div className="space-y-1">
									<Button size="sm" variant="outline" onClick={() => setControllableUrl(dummy.images.landscape)}>
										设置风景图
									</Button>
									<Button size="sm" variant="outline" onClick={() => setControllableUrl(dummy.images.dummyPurple)}>
										设置紫色图
									</Button>
									<Button size="sm" variant="outline" onClick={() => setControllableUrl('')}>
										清空
									</Button>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 自定义内容测试 */}
			<Card>
				<CardHeader>
					<CardTitle>自定义内容测试</CardTitle>
					<CardDescription>测试children插槽</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-4">
						<div className="space-y-2">
							<p className="text-sm text-gray-600">自定义内容</p>
							<ImagePreview defaultUrl={dummy.images.dummyYellow} notEditable className="w-32 h-24">
								<div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
									<span className="text-white font-bold">自定义内容</span>
								</div>
							</ImagePreview>
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">卡片样式</p>
							<ImagePreview defaultUrl={dummy.images.dummyPink} notEditable className="w-32 h-24">
								<Card className="w-full h-full">
									<CardContent className="p-4 flex flex-col items-center justify-center">
										<div className="text-xs text-gray-600">卡片内容</div>
										<div className="text-2xl">🎨</div>
									</CardContent>
								</Card>
							</ImagePreview>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
