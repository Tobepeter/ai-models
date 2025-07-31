import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'
import { feedMgr } from '../feed-mgr'
import { useFeedStore } from '../feed-store'

/* Feed 导航标题组件 */
export const FeedNavHeader = () => {
	const { loading, refreshing, clearError } = useFeedStore()

	const handleRefresh = () => {
		clearError()
		feedMgr.refresh()
	}

	return (
		<div className="flex items-center gap-2" data-slot="feed-nav-header">
			信息流
			<Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loading} className="h-8 w-8 p-0">
				<RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
			</Button>
		</div>
	)
}
