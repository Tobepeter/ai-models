import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { RefreshCw, Plus } from 'lucide-react'
import { feedMgr } from '../feed-mgr'
import { useFeedStore } from '../feed-store'
import { userUtil } from '@/pages/user/user-util'
import { notify } from '@/components/common/notify'
import { useUserStore } from '@/store/user-store'

/* Feed 导航标题组件 */
export const FeedNavHeader = () => {
	const { loading, refreshing, clearError, openCreateDialog } = useFeedStore()
	const { goLogin } = useUserStore()

	const handleRefresh = () => {
		clearError()
		feedMgr.refresh()
	}

	const handleCreate = () => {
		if (!userUtil.isLogin()) {
			notify.confirm({
				title: '需要登录',
				description: '请先登录后再创建内容',
				confirmText: '去登录',
				onConfirm: () => goLogin(),
			})
			return
		}
		openCreateDialog()
	}

	return (
		<div className="flex items-center gap-2" data-slot="feed-nav-header">
			信息流(WIP，还不是服务器同步的)
			<Button variant="ghost" size="sm" onClick={handleCreate} className="h-8 w-8 p-0">
				<Plus className="h-4 w-4" />
			</Button>
			<Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loading} className="h-8 w-8 p-0">
				<RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
			</Button>
		</div>
	)
}
