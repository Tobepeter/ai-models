import { FeedCreateDialog } from './components/feed-create-dialog'
import { Button } from '@/components/ui/button'
import { useFeedStore } from './feed-store'

/* 测试创建弹窗组件 */
export const TestCreateDialog = () => {
	const { openCreateDialog } = useFeedStore()

	return (
		<div className="p-4 space-y-4" data-slot="test-create-dialog">
			<h1 className="text-2xl font-bold">测试创建弹窗</h1>
			<Button onClick={openCreateDialog}>打开创建弹窗</Button>
			<FeedCreateDialog />
		</div>
	)
}
