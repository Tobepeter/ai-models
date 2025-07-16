import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Settings, X } from 'lucide-react'
import { useChatStore } from '../chat-store'

/**
 * 聊天无效模型提示弹窗组件
 */
export const ChatInvalidAlert = () => {
	const { showInvalidAlert, setData } = useChatStore()

	if (!showInvalidAlert) return null

	const handleClose = () => {
		setData({ showInvalidAlert: false })
	}

	const handleOpenSettings = () => {
		setData({ showInvalidAlert: false, showSettings: true })
	}

	return (
		<>
			<div className="fixed inset-0 bg-black/20 z-40" onClick={handleClose} />
			<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
				<Card className="bg-background border shadow-lg">
					<CardContent className="p-4">
						<div className="flex items-start justify-between mb-3">
							<div className="flex-1">
								<p className="text-sm text-muted-foreground">当前模型配置无效，请检查模型设置</p>
							</div>
							<Button variant="ghost" size="sm" onClick={handleClose} className="h-6 w-6 p-0">
								<X className="h-3 w-3" />
							</Button>
						</div>
						<div className="flex justify-end">
							<Button variant="outline" size="sm" onClick={handleOpenSettings} className="gap-1">
								<Settings className="h-3 w-3" />
								打开设置
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	)
}
