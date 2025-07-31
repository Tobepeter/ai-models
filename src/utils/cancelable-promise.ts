import { AnyFn } from './types'

type CancelableExecutor<T> = (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void, onCancel: (cb: AnyFn) => void) => void

export class CancelablePromise<T = any> extends Promise<T> {
	private _isCanceled = false
	private _isDone = false
	private _cancelHandlers: AnyFn[] = []

	constructor(executor: CancelableExecutor<T>) {
		let _resolve: (value: T | PromiseLike<T>) => void
		let _reject: (reason?: any) => void

		super((resolve, reject) => {
			_resolve = resolve
			_reject = reject
		})

		const wrappedResolve = (value: T | PromiseLike<T>) => {
			if (this._isCanceled || this._isDone) return
			this._isDone = true
			_resolve(value)
		}

		const wrappedReject = (reason?: any) => {
			if (this._isCanceled || this._isDone) return
			this._isDone = true
			_reject(reason)
		}

		const onCancel = (cb: AnyFn) => {
			this._cancelHandlers.push(cb)
		}

		executor(wrappedResolve, wrappedReject, onCancel)
	}

	cancel() {
		if (this._isCanceled || this._isDone) return
		this._isCanceled = true
		this._cancelHandlers.forEach((cb) => {
			try {
				cb()
			} catch (e) {
				// 忽略取消回调中的异常
			}
		})
		this._cancelHandlers = []
	}

	get isCanceled() {
		return this._isCanceled
	}

	get isDone() {
		return this._isDone
	}
}
