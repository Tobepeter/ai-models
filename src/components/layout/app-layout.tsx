import { Screen } from '@/components/common/screen'
import { Outlet } from 'react-router-dom'
import { AppHeader } from './app-header'

export const AppLayout = () => {
	return (
		<Screen>
			<div className="flex flex-col h-full bg-background">
				<AppHeader />
				<main className="flex-1 overflow-hidden">
					<Outlet />
				</main>
			</div>
		</Screen>
	)
}
