import { api } from '@/api/api'
import { notify } from '@/components/common/notify'
import { useMemoizedFn } from 'ahooks'
import { useCallback, useRef } from 'react'

interface FieldCheckState {
	isChecking: boolean
	pendingChecks: Set<string>
}

export const useFieldCheck = () => {
	const stateRef = useRef<FieldCheckState>({
		isChecking: false,
		pendingChecks: new Set(),
	})

	const checkField = useMemoizedFn(async (field: string, value: string): Promise<boolean | null> => {
		if (!value.trim()) return null

		const checkKey = `${field}:${value}`

		// 如果正在检查相同的字段值，返回null
		if (stateRef.current.pendingChecks.has(checkKey)) {
			return null
		}

		stateRef.current.pendingChecks.add(checkKey)
		stateRef.current.isChecking = true

		try {
			const result = await api.users.checkFieldList(
				{ field, value },
				{ silent: true } // 静默模式，不显示错误toast
			)
			if (!result) return null
			return result.data
		} catch (error) {
			console.error('字段检查失败:', error)
			return null
		} finally {
			stateRef.current.pendingChecks.delete(checkKey)
			stateRef.current.isChecking = stateRef.current.pendingChecks.size > 0
		}
	})

	const checkSubmitConflict = useMemoizedFn(() => {
		if (stateRef.current.isChecking) {
			notify.warning('字段检查中，请稍后提交')
			return true
		}
		return false
	})

	const isChecking = useCallback(() => stateRef.current.isChecking, [])

	return {
		checkField,
		checkSubmitConflict,
		isChecking,
	}
}
