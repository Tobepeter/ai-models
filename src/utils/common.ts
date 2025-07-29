import { CancelablePromise } from './cancelable-promise'

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const delayC = (ms: number) => {
	return new CancelablePromise((resolve, reject, onCancel) => {
		const timer = setTimeout(() => {
			resolve(true)
		}, ms)
		onCancel(() => clearTimeout(timer))
	})
}
