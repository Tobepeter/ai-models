import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserChangePwd } from '@/pages/user/components/user-change-pwd'
import { useUserStore } from '@/store/user-store'
import { Edit, LogOut, Settings, Key } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export const User = () => {
	// const { user, logout } = useAuthStore()
	const user = useUserStore((state) => state.profile)

	const { stats } = useUserStore()
	const navigate = useNavigate()
	const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false)

	const handleLogout = () => {
		// logout()
		navigate('/login')
	}

	if (!user) {
		return null // 这种情况不应该发生，因为有路由保护
	}

	return (
		<div className="p-6 max-w-2xl mx-auto space-y-6">
			{/* 用户信息卡片 */}
			<Card>
				<CardHeader>
					<div className="flex items-center space-x-4">
						<Avatar className="h-16 w-16">
							<AvatarImage src={user.avatar} alt={user.name} />
							<AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
						</Avatar>
						<div className="flex-1">
							<CardTitle className="text-xl">{user.name}</CardTitle>
							<CardDescription>{user.email}</CardDescription>
							<p className="text-sm text-muted-foreground mt-1">
								注册时间：2025-01-01
							</p>
							<p className="text-sm text-muted-foreground">
								最后更新：2025-01-01
							</p>
						</div>
						<Button variant="outline" size="sm">
							<Edit className="h-4 w-4 mr-2" />
							编辑
						</Button>
					</div>
				</CardHeader>
			</Card>

			{/* 使用统计 */}
			<Card>
				<CardHeader>
					<CardTitle>使用统计</CardTitle>
					<CardDescription>您的AI助手使用情况</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex justify-between items-center">
						<span className="text-sm">文本对话次数</span>
						<span className="font-medium">{stats.textChatCount} 次</span>
					</div>
					<Separator />
					<div className="flex justify-between items-center">
						<span className="text-sm">图像生成次数</span>
						<span className="font-medium">{stats.imageGenCount} 次</span>
					</div>
					<Separator />
					<div className="flex justify-between items-center">
						<span className="text-sm">音频生成次数</span>
						<span className="font-medium">{stats.audioGenCount} 次</span>
					</div>
					<Separator />
					<div className="flex justify-between items-center">
						<span className="text-sm">视频生成次数</span>
						<span className="font-medium">{stats.videoGenCount} 次</span>
					</div>
					<Separator />
					<div className="flex justify-between items-center">
						<span className="text-sm">AI对比使用</span>
						<span className="font-medium">{stats.chatHubUsageCount} 次</span>
					</div>
					<Separator />
					<div className="flex justify-between items-center">
						<span className="text-sm">本月活跃天数</span>
						<span className="font-medium">{stats.monthlyActiveDays} 天</span>
					</div>
					<Separator />
					<div className="flex justify-between items-center">
						<span className="text-sm">总使用天数</span>
						<span className="font-medium">{stats.totalUsageDays} 天</span>
					</div>
				</CardContent>
			</Card>

			{/* 设置选项 */}
			<Card>
				<CardHeader>
					<CardTitle>设置</CardTitle>
					<CardDescription>应用偏好和配置</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<Button variant="ghost" className="w-full justify-start">
						<Settings className="h-4 w-4 mr-2" />
						应用设置
					</Button>
					<Button 
						variant="ghost" 
						className="w-full justify-start"
						onClick={() => setShowChangePasswordDialog(true)}
					>
						<Key className="h-4 w-4 mr-2" />
						修改密码
					</Button>
					<Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
						<LogOut className="h-4 w-4 mr-2" />
						退出登录
					</Button>
				</CardContent>
			</Card>

			{/* 修改密码对话框 */}
			<UserChangePwd 
				open={showChangePasswordDialog}
				onOpenChange={setShowChangePasswordDialog}
			/>
		</div>
	)
}
