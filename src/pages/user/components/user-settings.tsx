import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/store/user-store'
import { authApi } from '@/api/auth/auth-api'
import { Settings, Key, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface UserSettingsProps {
	onChangePassword?: () => void
}

/** 用户设置组件 */
export const UserSettings = (props: UserSettingsProps) => {
	const { onChangePassword } = props
	const { info: user, token } = useUserStore()
	const navigate = useNavigate()

	const isLoggedIn = token && user && user.username !== 'anonymous'

	const handleLogout = async () => {
		try {
			await authApi.logout()
		} catch (error) {
			console.error('Logout failed:', error)
		}
		navigate('/login')
	}

	return (
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
						<Button variant="ghost" className="w-full justify-start" onClick={onChangePassword}>
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
	)
}
