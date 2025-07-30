import { userApi } from '@/api/user/user-api'
import { FormItem } from '@/components/common/form/form-item'
import { FormLabel } from '@/components/common/form/form-label'
import { FormPwd } from '@/components/common/form/form-pwd'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useMemoizedFn } from 'ahooks'
import { useState } from 'react'

interface ChangePasswordForm {
	oldPassword: string
	newPassword: string
	confirmPassword: string
}
type FormErrors = Record<string, string | undefined>

export const UserChangePwd = (props: UserChangePwdProps) => {
	const { open, onOpenChange } = props

	const [formData, setFormData] = useState<ChangePasswordForm>({
		oldPassword: '',
		newPassword: '',
		confirmPassword: '',
	})

	const [errors, setErrors] = useState<FormErrors>({})
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleInputChange = useMemoizedFn((field: keyof ChangePasswordForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({ ...prev, [field]: e.target.value }))
		// 清除该字段的错误
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }))
		}
	})

	const validateForm = useMemoizedFn(() => {
		const newErrors: FormErrors = {}

		if (!formData.oldPassword) {
			newErrors.oldPassword = '请输入原密码'
		}

		if (!formData.newPassword) {
			newErrors.newPassword = '请输入新密码'
		} else if (formData.newPassword.length < 6) {
			newErrors.newPassword = '新密码长度至少为6位'
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = '请确认新密码'
		} else if (formData.newPassword !== formData.confirmPassword) {
			newErrors.confirmPassword = '两次输入的密码不一致'
		}

		if (formData.oldPassword && formData.newPassword && formData.oldPassword === formData.newPassword) {
			newErrors.newPassword = '新密码不能与原密码相同'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	})

	const handleSubmit = useMemoizedFn(async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) return

		setIsSubmitting(true)

		try {
			await userApi.updatePassword({
				old_password: formData.oldPassword,
				new_password: formData.newPassword,
			})

			// 重置表单
			setFormData({
				oldPassword: '',
				newPassword: '',
				confirmPassword: '',
			})
			setErrors({})

			// 关闭对话框
			onOpenChange(false)

			// 显示成功提示（这里可以使用toast，暂时用alert）
			alert('密码修改成功')
		} catch (error) {
			setErrors({
				general: error instanceof Error ? error.message : '修改密码失败',
			})
		} finally {
			setIsSubmitting(false)
		}
	})

	const handleCancel = useMemoizedFn(() => {
		setFormData({
			oldPassword: '',
			newPassword: '',
			confirmPassword: '',
		})
		setErrors({})
		onOpenChange(false)
	})

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>修改密码</DialogTitle>
					<DialogDescription>请输入原密码和新密码来修改您的登录密码</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* 隐藏的用户名字段，用于提高无障碍访问性 */}
					<input type="text" name="username" autoComplete="username" className="hidden" tabIndex={-1} readOnly />
					<FormItem>
						<FormLabel htmlFor="old-password">原密码</FormLabel>
						<FormPwd
							id="old-password"
							placeholder="请输入原密码"
							value={formData.oldPassword}
							onChange={handleInputChange('oldPassword')}
							error={errors.oldPassword}
							autoComplete="current-password"
							disabled={isSubmitting}
						/>
					</FormItem>

					<FormItem>
						<FormLabel htmlFor="new-password">新密码</FormLabel>
						<FormPwd
							id="new-password"
							placeholder="请输入新密码（至少6位）"
							value={formData.newPassword}
							onChange={handleInputChange('newPassword')}
							error={errors.newPassword}
							autoComplete="new-password"
							disabled={isSubmitting}
						/>
					</FormItem>

					<FormItem>
						<FormLabel htmlFor="confirm-password">确认新密码</FormLabel>
						<FormPwd
							id="confirm-password"
							placeholder="请再次输入新密码"
							value={formData.confirmPassword}
							onChange={handleInputChange('confirmPassword')}
							error={errors.confirmPassword}
							autoComplete="new-password"
							disabled={isSubmitting}
						/>
					</FormItem>

					{errors.general && <div className="text-sm text-destructive text-center">{errors.general}</div>}

					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
							取消
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? '修改中...' : '确认修改'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export interface UserChangePwdProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}
