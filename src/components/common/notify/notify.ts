import { toast } from 'sonner'
import { DialogConfig, useNotifyStore } from './notify-store'

class Notify {
	success = toast.success
	error = toast.error
	warning = toast.warning
	info = toast.info
	loading = toast.loading
	custom = toast.custom

	// Dialog 接口 - 使用 store
	confirm = (config: DialogConfig) => {
		const { showConfirmDialog } = useNotifyStore.getState()
		showConfirmDialog(config)
	}

	// 便捷方法
	promise = <T>(
		promise: Promise<T>,
		msgs: {
			loading: string
			success: string
			error: string
		}
	) => toast.promise(promise, msgs)
}

export const notify = new Notify()
