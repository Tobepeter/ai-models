import { FC } from 'react'

/**
 * 条件 hook 包装器
 */
export const withCondHook = (fn: AnyFn, cond: boolean): FC => {
	if (!cond) return null

	return () => {
		fn()
		return null
	}
}
