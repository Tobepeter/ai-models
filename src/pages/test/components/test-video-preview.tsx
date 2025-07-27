import { useState } from 'react'
import { VideoPreview } from '@/components/common/video-preview'
import { dummy } from '@/utils/dummy'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * 测试视频预览组件
 */
const TestVideoPreview = () => {
	const [uploadedUrl, setUploadedUrl] = useState<string>('')
	const [controllableUrl, setControllableUrl] = useState<string>(dummy.videos.bunny)

	const handleUpload = (file: File) => {
		console.log('文件上传:', file)
	}

	const handleDelete = () => {
		console.log('删除视频')
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
			<h1 className="text-2xl font-bold">视频预览组件测试</h1>

			{/* 基础测试 */}
			<Card>
				<CardHeader>
					<CardTitle>基础功能</CardTitle>
					<CardDescription>测试基本的视频预览功能</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="space-y-2">
							<p className="text-sm text-gray-600">无URL，可编辑</p>
							<VideoPreview onUpload={handleUpload} onDelete={handleDelete} onChange={handleChange} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">无URL，不可编辑</p>
							<VideoPreview notEditable />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">有defaultUrl，可编辑</p>
							<VideoPreview defaultUrl={dummy.videos.elephants} onUpload={handleUpload} onDelete={handleDelete} onChange={handleChange} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">有defaultUrl，不可编辑</p>
							<VideoPreview defaultUrl={dummy.videos.forBiggerBlazes} notEditable />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 封面测试 */}
			<Card>
				<CardHeader>
					<CardTitle>封面功能测试</CardTitle>
					<CardDescription>测试自定义封面功能</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="space-y-2">
							<p className="text-sm text-gray-600">默认封面</p>
							<VideoPreview defaultUrl={dummy.videos.bunny} notEditable size={160} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">自定义封面 - 风景</p>
							<VideoPreview defaultUrl={dummy.videos.bunny} cover={dummy.images.landscape} notEditable size={160} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">自定义封面 - 头像</p>
							<VideoPreview defaultUrl={dummy.videos.elephants} cover={dummy.images.avatar} notEditable size={160} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">自定义封面 - 彩色</p>
							<VideoPreview defaultUrl={dummy.videos.forBiggerFun} cover={dummy.images.dummyBlue} notEditable size={160} />
						</div>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<p className="text-sm text-gray-600">可编辑 + 自定义封面</p>
							<VideoPreview defaultUrl={dummy.videos.forBiggerBlazes} cover={dummy.images.dummyGreen} size={160} onUpload={handleUpload} onDelete={handleDelete} onChange={handleChange} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">竖版封面</p>
							<VideoPreview defaultUrl={dummy.videos.forBiggerEscapes} cover={dummy.images.portrait} notEditable width={120} height={160} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">方形封面</p>
							<VideoPreview defaultUrl={dummy.videos.forBiggerJoyrides} cover={dummy.images.square} notEditable size={160} />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 尺寸测试 */}
			<Card>
				<CardHeader>
					<CardTitle>尺寸测试</CardTitle>
					<CardDescription>测试不同尺寸的视频预览</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-end gap-4">
						<div className="space-y-2">
							<p className="text-sm text-gray-600">默认尺寸 (128px)</p>
							<VideoPreview defaultUrl={dummy.videos.bunny} notEditable />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">小尺寸 (80px)</p>
							<VideoPreview defaultUrl={dummy.videos.forBiggerEscapes} notEditable size={80} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">大尺寸 (200px)</p>
							<VideoPreview defaultUrl={dummy.videos.forBiggerFun} notEditable size={200} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">自定义宽高</p>
							<VideoPreview defaultUrl={dummy.videos.forBiggerJoyrides} notEditable width={240} height={180} />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 视频库测试 */}
			<Card>
				<CardHeader>
					<CardTitle>视频库测试</CardTitle>
					<CardDescription>测试不同类型的视频内容</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<p className="text-sm text-gray-600">大兔子视频</p>
							<VideoPreview defaultUrl={dummy.videos.bunny} notEditable size={160} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">象群之梦</p>
							<VideoPreview defaultUrl={dummy.videos.elephants} notEditable size={160} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">更大的火焰</p>
							<VideoPreview defaultUrl={dummy.videos.forBiggerBlazes} notEditable size={160} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">更大的逃脱</p>
							<VideoPreview defaultUrl={dummy.videos.forBiggerEscapes} notEditable size={160} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">更大的乐趣</p>
							<VideoPreview defaultUrl={dummy.videos.forBiggerFun} notEditable size={160} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">更大的兜风</p>
							<VideoPreview defaultUrl={dummy.videos.forBiggerJoyrides} notEditable size={160} />
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
							<VideoPreview onUpload={handleUpload} onDelete={handleDelete} onChange={handleChange} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">外部状态控制（有URL属性）</p>
							<p className="text-xs text-gray-500">当前URL: {controllableUrl || '无'}</p>
							<div className="flex items-center gap-2">
								<VideoPreview url={controllableUrl} onUpload={handleUpload} onDelete={handleDelete} onChange={handleControllableChange} />
								<div className="space-y-1">
									<Button size="sm" variant="outline" onClick={() => setControllableUrl(dummy.videos.bunny)}>
										兔子视频
									</Button>
									<Button size="sm" variant="outline" onClick={() => setControllableUrl(dummy.videos.elephants)}>
										象群视频
									</Button>
									<Button size="sm" variant="outline" onClick={() => setControllableUrl(dummy.videos.forBiggerMeltdowns)}>
										崩溃视频
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
							<VideoPreview defaultUrl={dummy.videos.forBiggerFun} notEditable className="w-32 h-24">
								<div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
									<span className="text-white font-bold">🎬 视频</span>
								</div>
							</VideoPreview>
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">卡片样式</p>
							<VideoPreview defaultUrl={dummy.videos.forBiggerJoyrides} notEditable className="w-32 h-24">
								<Card className="w-full h-full">
									<CardContent className="p-4 flex flex-col items-center justify-center">
										<div className="text-xs text-gray-600">视频内容</div>
										<div className="text-2xl">🎥</div>
									</CardContent>
								</Card>
							</VideoPreview>
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">可编辑自定义</p>
							<VideoPreview defaultUrl={dummy.videos.bunny} className="w-32 h-24" onUpload={handleUpload} onDelete={handleDelete} onChange={handleChange}>
								<div className="w-full h-full bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center relative">
									<span className="text-white font-bold">📹 可编辑</span>
								</div>
							</VideoPreview>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 播放器测试 */}
			<Card>
				<CardHeader>
					<CardTitle>播放器测试</CardTitle>
					<CardDescription>测试视频播放功能（点击视频会打开播放器）</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-4">
						<div className="space-y-2">
							<p className="text-sm text-gray-600">横屏视频</p>
							<VideoPreview defaultUrl={dummy.videos.bunny} notEditable width={200} height={150} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">竖屏尺寸</p>
							<VideoPreview defaultUrl={dummy.videos.forBiggerEscapes} notEditable width={120} height={180} />
						</div>

						<div className="space-y-2">
							<p className="text-sm text-gray-600">正方形</p>
							<VideoPreview defaultUrl={dummy.videos.forBiggerFun} notEditable size={160} />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default TestVideoPreview
