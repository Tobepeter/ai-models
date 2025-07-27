import { useState } from 'react'
import { UserAvatar } from '@/components/common/user-avatar'
import { ImagePreview } from '@/components/common/image-preview'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Heart, Star } from 'lucide-react'

/**
 * UserAvatar 组件测试
 */
const TestUserAvatar = () => {
	const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face')
	const [customSize, setCustomSize] = useState(60)

	return (
		<div className="p-6 max-w-4xl mx-auto space-y-6">
			{/* 基础用法测试 */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						基础用法
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-4 flex-wrap">
						<div className="text-center space-y-2">
							<UserAvatar src={avatarUrl} size={40} />
							<p className="text-xs text-muted-foreground">有头像 (40px)</p>
						</div>
						<div className="text-center space-y-2">
							<UserAvatar size={40} />
							<p className="text-xs text-muted-foreground">无头像 (40px)</p>
						</div>
						<div className="text-center space-y-2">
							<UserAvatar src={avatarUrl} size={80} />
							<p className="text-xs text-muted-foreground">大尺寸 (80px)</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 交互控制测试 */}
			<Card>
				<CardHeader>
					<CardTitle>交互控制</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="avatar-url">头像URL</Label>
							<Input id="avatar-url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="输入头像URL" />
						</div>
						<div className="space-y-2">
							<Label htmlFor="avatar-size">头像尺寸</Label>
							<Input id="avatar-size" type="number" value={customSize} onChange={(e) => setCustomSize(Number(e.target.value))} min="20" max="200" />
						</div>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => setAvatarUrl('')}>
							清空头像
						</Button>
						<Button variant="outline" onClick={() => setAvatarUrl('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face')}>
							恢复默认
						</Button>
					</div>
					<div className="flex items-center gap-4">
						<UserAvatar src={avatarUrl} size={customSize} />
						<p className="text-sm text-muted-foreground">动态头像 ({customSize}px)</p>
					</div>
				</CardContent>
			</Card>

			{/* 特殊状态 */}
			<Card>
				<CardHeader>
					<CardTitle>特殊状态</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-6 flex-wrap">
						<div className="text-center space-y-2">
							<UserAvatar src={avatarUrl} size={60} fallbackText="张" />
							<p className="text-xs text-muted-foreground">有图片忽略fallbackText</p>
						</div>
						<div className="text-center space-y-2">
							<UserAvatar size={60} fallbackText="李四" />
							<p className="text-xs text-muted-foreground">仅文字fallback</p>
						</div>
						<div className="text-center space-y-2">
							<UserAvatar size={60} fallbackText="AB" />
							<p className="text-xs text-muted-foreground">英文fallback</p>
						</div>
						<div className="text-center space-y-2">
							<UserAvatar size={60} />
							<p className="text-xs text-muted-foreground">静态图标fallback</p>
						</div>
						<div className="text-center space-y-2">
							<UserAvatar src={avatarUrl} size={60} loading />
							<p className="text-xs text-muted-foreground">加载中</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 点击行为测试 */}
			<Card>
				<CardHeader>
					<CardTitle>点击行为</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-6 flex-wrap">
						<div className="text-center space-y-2">
							<UserAvatar src={avatarUrl} size={60} />
							<p className="text-xs text-muted-foreground">可点击预览</p>
						</div>
						<div className="text-center space-y-2">
							<UserAvatar src={avatarUrl} size={60} noPreview />
							<p className="text-xs text-muted-foreground">不可点击</p>
						</div>
						<div className="text-center space-y-2">
							<UserAvatar size={60} fallbackText="预览" />
							<p className="text-xs text-muted-foreground">文字可预览</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* ImagePreview children 功能测试 */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Heart className="h-5 w-5" />
						ImagePreview 自定义内容
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-6 flex-wrap">
						<div className="text-center space-y-2">
							<ImagePreview url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face" size={60} noInteraction={true} className="rounded-full">
								<div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
									<span className="text-white font-bold text-lg">JD</span>
								</div>
							</ImagePreview>
							<p className="text-xs text-muted-foreground">自定义内容+预览</p>
						</div>
						<div className="text-center space-y-2">
							<ImagePreview size={60} className="rounded-full">
								<div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
									<Star className="w-6 h-6 text-white" />
								</div>
							</ImagePreview>
							<p className="text-xs text-muted-foreground">纯自定义内容</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default TestUserAvatar
