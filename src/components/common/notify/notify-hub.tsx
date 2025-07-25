import { Toaster } from '@/components/ui/sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useNotifyStore } from './notify-store'

/**
 * 通知系统统一入口组件
 * 包含 Toast 容器和 Dialog 组件
 */
export const NotifyHub = () => {
	const { showDialog, dialogConfig, hideDialog } = useNotifyStore()

	const handleConfirm = () => {
		dialogConfig?.onConfirm?.()
		hideDialog()
	}

	const handleCancel = () => {
		dialogConfig?.onCancel?.()
		hideDialog()
	}

	return (
		<>
			{/* Sonner Toast 容器 */}
			<Toaster position="top-right" />

			{/* 确认对话框 */}
			<Dialog open={showDialog} onOpenChange={hideDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{dialogConfig?.title}</DialogTitle>
						<DialogDescription>{dialogConfig?.description}</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={handleCancel}>
							{dialogConfig?.cancelText || '取消'}
						</Button>
						<Button onClick={handleConfirm}>{dialogConfig?.confirmText || '确认'}</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
