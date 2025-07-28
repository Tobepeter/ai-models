import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { UserAvatar } from '@/components/common/user-avatar'
import { FileUpload } from '@/components/common/file-upload'
import { UserChangePwd } from '@/pages/user/components/user-change-pwd'
import { useUserStore } from '@/store/user-store'
import { authApi } from '@/api/auth/auth-api'
import { Edit, LogOut, Settings, Key, LogIn, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import { ossClient } from '@/utils/oss/oss-client'
import { OssUploadResult } from '@/utils/oss/oss-types'

export const User = () => {
	const { info: user, token, goLogin, setData } = useUserStore()
	const navigate = useNavigate()
	const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false)
	const [avatarLoading, setAvatarLoading] = useState(false)
	const currentObjectKeyRef = useRef<string>(user?.avatar_oss_key || '')

	const handleLogout = async () => {
		try {
			await authApi.logout()
		} catch (error) {
			console.error('Logout failed:', error)
		}
		navigate('/login')
	}

	// Handle avatar upload
	const handleAvatarUpload = async (file: File, result?: OssUploadResult) => {
		if (!result) return

		setAvatarLoading(true)
		try {
			// If there's an old avatar, silently delete it
			if (currentObjectKeyRef.current) {
				ossClient.deleteFile(currentObjectKeyRef.current).catch((error) => {
					console.warn('[User] Failed to delete old avatar:', error)
				})
			}

			// Update the user's avatar in the store
			setData({
				info: {
					...user,
					avatar: result.url || '',
					avatar_oss_key: result.objectKey,
				},
			})

			// Save the new objectKey
			currentObjectKeyRef.current = result.objectKey

			// TODO: Update the user's avatar in the backend
			// This would typically involve an API call to update the user's avatar URL and object key
		} catch (error) {
			console.error('Avatar update failed:', error)
		} finally {
			setAvatarLoading(false)
		}
	}

	// 判断是否已登录（有token且用户名不是anonymous）
	const isLoggedIn = token && user && user.username !== 'anonymous'

	// 显示的用户信息（登录时显示真实信息，未登录时显示默认值）
	const displayUser = isLoggedIn
		? user
		: {
				username: 'anonymous',
				email: 'anonymous@example.com',
				avatar: '',
				created_at: '',
				updated_at: '',
			}

	return (
		<div className="p-6 max-w-2xl mx-auto space-y-6">
			{/* 用户信息卡片 */}
			<Card>
				<CardHeader>
					<div className="flex items-center space-x-4">
						<div className="flex flex-col items-center">
							<UserAvatar 
								src={displayUser.avatar} 
								alt={displayUser.username} 
								size={64}
								fallbackText={displayUser.username.charAt(0).toUpperCase()}
								loading={avatarLoading}
							/>
							{isLoggedIn && (
								<FileUpload 
									ossEnable 
									onUpload={handleAvatarUpload}
									onLoadingChange={setAvatarLoading}
								>
									<Button variant="ghost" size="sm" className="mt-2 h-8 px-2">
										<Upload className="h-4 w-4 mr-1" />
										更换头像
									</Button>
								</FileUpload>
							)}
						</div>
						<div className="flex-1">
							<CardTitle className="text-xl">{displayUser.username}</CardTitle>
							<CardDescription>{displayUser.email}</CardDescription>
							{isLoggedIn ? (
								<>
									<p className="text-sm text-muted-foreground mt-1">注册时间：{new Date(displayUser.created_at).toLocaleDateString()}</p>
									<p className="text-sm text-muted-foreground">最后更新：{new Date(displayUser.updated_at).toLocaleDateString()}</p>
								</>
							) : (
								<p className="text-sm text-muted-foreground mt-1">请登录以查看详细信息</p>
							)}
						</div>
						{isLoggedIn ? (
							<Button variant="outline" size="sm">
								<Edit className="h-4 w-4 mr-2" />
								编辑
							</Button>
						) : (
							<Button onClick={() => goLogin()} size="sm">
								<LogIn className="h-4 w-4 mr-2" />
								登录
							</Button>
						)}
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
						<span className="font-medium">128 次</span>
					</div>
					<Separator />
					<div className="flex justify-between items-center">
						<span className="text-sm">图像生成次数</span>
						<span className="font-medium">45 次</span>
					</div>
					<Separator />
					<div className="flex justify-between items-center">
						<span className="text-sm">音频生成次数</span>
						<span className="font-medium">12 次</span>
					</div>
					<Separator />
					<div className="flex justify-between items-center">
						<span className="text-sm">视频生成次数</span>
						<span className="font-medium">8 次</span>
					</div>
					<Separator />
					<div className="flex justify-between items-center">
						<span className="text-sm">AI对比使用</span>
						<span className="font-medium">23 次</span>
					</div>
					<Separator />
					<div className="flex justify-between items-center">
						<span className="text-sm">本月活跃天数</span>
						<span className="font-medium">15 天</span>
					</div>
					<Separator />
					<div className="flex justify-between items-center">
						<span className="text-sm">总使用天数</span>
						<span className="font-medium">89 天</span>
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
					{isLoggedIn && (
						<>
							<Button variant="ghost" className="w-full justify-start" onClick={() => setShowChangePasswordDialog(true)}>
								<Key className="h-4 w-4 mr-2" />
								修改密码
							</Button>
							<Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
								<LogOut className="h-4 w-4 mr-2" />
								退出登录
							</Button>
						</>
					)}
				</CardContent>
			</Card>

			{/* 修改密码对话框 - 只在已登录时显示 */}
			{isLoggedIn && <UserChangePwd open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog} />}
		</div>
	)
}
