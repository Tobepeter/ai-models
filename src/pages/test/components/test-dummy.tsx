import { useState } from 'react'
import { dummy } from '@/utils/dummy'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

/**
 * 测试占位数据展示组件
 */
const TestDummy = () => {
	const [playingVideo, setPlayingVideo] = useState<string | null>(null)
	const [playingAudio, setPlayingAudio] = useState<string | null>(null)

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text)
	}

	return (
		<div className="w-full max-w-6xl mx-auto p-4 space-y-6">
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold">占位数据展示</h1>
				<p className="text-muted-foreground">快速浏览和使用各种测试数据</p>
			</div>

			<Tabs defaultValue="images" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="images">图片</TabsTrigger>
					<TabsTrigger value="videos">视频</TabsTrigger>
					<TabsTrigger value="audios">音频</TabsTrigger>
				</TabsList>

				<TabsContent value="images" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>头像类图片</CardTitle>
							<CardDescription>各种头像占位图片</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="text-center space-y-2">
									<Avatar className="w-20 h-20 mx-auto">
										<AvatarImage src={dummy.images.avatar} alt="随机头像" />
										<AvatarFallback>A</AvatarFallback>
									</Avatar>
									<Badge variant="secondary">随机头像</Badge>
									<Button variant="outline" size="sm" onClick={() => copyToClipboard(dummy.images.avatar)}>
										复制链接
									</Button>
								</div>
								<div className="text-center space-y-2">
									<Avatar className="w-20 h-20 mx-auto">
										<AvatarImage src={dummy.images.avatarFemale} alt="女性头像" />
										<AvatarFallback>F</AvatarFallback>
									</Avatar>
									<Badge variant="secondary">女性头像</Badge>
									<Button variant="outline" size="sm" onClick={() => copyToClipboard(dummy.images.avatarFemale)}>
										复制链接
									</Button>
								</div>
								<div className="text-center space-y-2">
									<Avatar className="w-20 h-20 mx-auto">
										<AvatarImage src={dummy.images.avatarMale} alt="男性头像" />
										<AvatarFallback>M</AvatarFallback>
									</Avatar>
									<Badge variant="secondary">男性头像</Badge>
									<Button variant="outline" size="sm" onClick={() => copyToClipboard(dummy.images.avatarMale)}>
										复制链接
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>风景图片</CardTitle>
							<CardDescription>各种尺寸的占位图片</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{Object.entries(dummy.images)
									.filter(([key]) => !key.includes('avatar') && !key.includes('dummy'))
									.map(([name, url]) => (
										<div key={name} className="text-center space-y-2">
											<img src={url} alt={name} className="w-full h-32 object-cover rounded-lg border" />
											<Badge variant="outline">{name}</Badge>
											<Button variant="outline" size="sm" onClick={() => copyToClipboard(url)}>
												复制链接
											</Button>
										</div>
									))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>占位图片</CardTitle>
							<CardDescription>各种颜色的占位图片</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{Object.entries(dummy.images)
									.filter(([key]) => key.includes('dummy'))
									.map(([name, url]) => (
										<div key={name} className="text-center space-y-2">
											<img src={url} alt={name} className="w-full h-24 object-cover rounded-lg border" />
											<Badge variant="secondary">{name.replace('dummy', '')}</Badge>
											<Button variant="outline" size="sm" onClick={() => copyToClipboard(url)}>
												复制链接
											</Button>
										</div>
									))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="videos" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>测试视频</CardTitle>
							<CardDescription>Google 提供的测试视频资源</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{Object.entries(dummy.videos).map(([name, url]) => (
									<div key={name} className="space-y-3">
										<div className="flex items-center justify-between">
											<Badge variant="outline">{name}</Badge>
											<Button variant="outline" size="sm" onClick={() => copyToClipboard(url)}>
												复制链接
											</Button>
										</div>
										<video controls className="w-full rounded-lg border" style={{ maxHeight: '200px' }} onPlay={() => setPlayingVideo(name)} onPause={() => setPlayingVideo(null)}>
											<source src={url} type="video/mp4" />
											您的浏览器不支持视频标签
										</video>
										{playingVideo === name && <Badge variant="secondary">正在播放</Badge>}
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="audios" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>测试音频</CardTitle>
							<CardDescription>各种格式的测试音频文件</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{Object.entries(dummy.audios).map(([name, url]) => (
									<div key={name} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex items-center space-x-3">
											<Badge variant="outline">{name.toUpperCase()}</Badge>
											<span className="text-sm text-muted-foreground">{name === 'wav' ? '铃声' : name === 'mp3' ? '示例歌曲' : '示例音频'}</span>
										</div>
										<div className="flex items-center space-x-2">
											<audio controls className="h-8" onPlay={() => setPlayingAudio(name)} onPause={() => setPlayingAudio(null)}>
												<source src={url} type={`audio/${name}`} />
												您的浏览器不支持音频标签
											</audio>
											<Button variant="outline" size="sm" onClick={() => copyToClipboard(url)}>
												复制链接
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}

export default TestDummy;
