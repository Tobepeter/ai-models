import { UserCard } from './components/user-card'
import { UserStatistic } from './components/user-statistic'
import { UserSettings } from './components/user-settings'
import { UserChangePwd } from './components/user-change-pwd'
import { useUserStore } from '@/store/user-store'
import { useState } from 'react'

export const User = () => {
	const { info: user, token } = useUserStore()
	const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false)

	const isLoggedIn = token && user && user.username !== 'anonymous'

	return (
		<div className="p-6 max-w-2xl mx-auto space-y-6" data-slot="user">
			<UserCard />
			<UserStatistic />
			<UserSettings onChangePassword={() => setShowChangePasswordDialog(true)} />
			{isLoggedIn && <UserChangePwd open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog} />}
		</div>
	)
}
